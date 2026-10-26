using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FashionStore.Application.Common;
using FashionStore.Application.DTOs;
using FashionStore.Domain.Entities;
using FashionStore.Infrastructure.Data;
using FashionStore.Infrastructure.Services;

namespace FashionStore.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly FashionStoreDbContext _context;
        private readonly IRazorpayPaymentService _razorpayService;

        public OrdersController(FashionStoreDbContext context, IRazorpayPaymentService razorpayService)
        {
            _context = context;
            _razorpayService = razorpayService;
        }

        [HttpPost("initiate-checkout")]
        public async Task<ActionResult<ApiResponse<CheckoutResponseDto>>> InitiateCheckout([FromBody] InitiateCheckoutRequestDto request)
        {
            if (request.Items == null || !request.Items.Any())
            {
                return BadRequest(ApiResponse<CheckoutResponseDto>.Fail("No couture ensembles provided in the order request."));
            }

            // 1. Fetch live product variants & calculate server-side totals
            var variantIds = request.Items.Select(i => i.VariantId).ToList();
            var variants = await _context.ProductVariants
                .Include(v => v.Product)
                .Include(v => v.Inventory)
                .Where(v => variantIds.Contains(v.Id))
                .ToListAsync();

            if (variants.Count != request.Items.Count)
            {
                return BadRequest(ApiResponse<CheckoutResponseDto>.Fail("One or more selected items are unavailable."));
            }

            decimal subtotal = 0m;
            foreach (var item in request.Items)
            {
                var variant = variants.First(v => v.Id == item.VariantId);

                // Stock validation
                if (variant.Inventory == null || variant.Inventory.QuantityAvailable < item.Quantity)
                {
                    return BadRequest(ApiResponse<CheckoutResponseDto>.Fail($"Insufficient stock for {variant.Product.Title} (Size: {variant.Size})."));
                }

                decimal unitPrice = (variant.Product.SalePrice ?? variant.Product.BasePrice) + variant.PriceAdjustment;
                subtotal += unitPrice * item.Quantity;
            }

            // 2. Validate Coupon
            decimal discount = 0m;
            if (!string.IsNullOrWhiteSpace(request.CouponCode))
            {
                var code = request.CouponCode.Trim().ToUpperInvariant();
                var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code && c.IsActive);
                if (coupon != null && subtotal >= coupon.MinOrderAmount)
                {
                    discount = coupon.DiscountType == "Percentage"
                        ? Math.Round((subtotal * coupon.DiscountValue) / 100m, 2)
                        : coupon.DiscountValue;

                    if (coupon.MaxDiscountAmount.HasValue)
                    {
                        discount = Math.Min(discount, coupon.MaxDiscountAmount.Value);
                    }
                }
            }

            decimal shippingFee = subtotal > 2999m ? 0m : 250m;
            decimal totalAmount = Math.Max(0m, subtotal - discount + shippingFee);

            // 3. Find or Create User & Address
            var user = await _context.Users.FirstOrDefaultAsync() ?? new User
            {
                FullName = request.ShippingAddress.RecipientName,
                Email = "customer@mirayacouture.com",
                PhoneNumber = request.ShippingAddress.Phone
            };

            var address = new Address
            {
                UserId = user.Id,
                RecipientName = request.ShippingAddress.RecipientName,
                Phone = request.ShippingAddress.Phone,
                AddressType = request.ShippingAddress.AddressType,
                StreetLine1 = request.ShippingAddress.StreetLine1,
                StreetLine2 = request.ShippingAddress.StreetLine2,
                City = request.ShippingAddress.City,
                State = request.ShippingAddress.State,
                Pincode = request.ShippingAddress.Pincode
            };
            _context.Addresses.Add(address);

            // 4. Create Order & Generate Order Number
            string orderNumber = $"MC-{DateTime.UtcNow.Year}-{new Random().Next(1000, 9999)}";
            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = user.Id,
                ShippingAddress = address,
                SubtotalAmount = subtotal,
                DiscountAmount = discount,
                ShippingFee = shippingFee,
                TotalAmount = totalAmount,
                Status = OrderStatus.Placed,
                PaymentStatus = PaymentStatus.Pending,
                CourierPartner = "BlueDart Express Luxury Air",
                TrackingNumber = $"BD-{new Random().Next(10000000, 99999999)}",
                EstimatedDeliveryUtc = DateTimeOffset.UtcNow.AddDays(4)
            };

            foreach (var item in request.Items)
            {
                var variant = variants.First(v => v.Id == item.VariantId);
                decimal unitPrice = (variant.Product.SalePrice ?? variant.Product.BasePrice) + variant.PriceAdjustment;

                order.Items.Add(new OrderItem
                {
                    VariantId = variant.Id,
                    ProductTitleSnapshot = variant.Product.Title,
                    VariantSkuSnapshot = variant.VariantSku,
                    SizeSnapshot = variant.Size,
                    ColorSnapshot = variant.ColorName,
                    PrimaryImageSnapshot = variant.Product.Images.FirstOrDefault()?.ImageUrl ?? "",
                    UnitPrice = unitPrice,
                    Quantity = item.Quantity,
                    LineTotal = unitPrice * item.Quantity
                });
            }

            _context.Orders.Add(order);

            // 5. Generate Razorpay Order
            string razorpayOrderId = await _razorpayService.CreateOrderAsync(orderNumber, totalAmount);
            var payment = new Payment
            {
                OrderId = order.Id,
                RazorpayOrderId = razorpayOrderId,
                Amount = totalAmount,
                Currency = "INR",
                Status = "Created"
            };
            _context.Payments.Add(payment);

            await _context.SaveChangesAsync();

            var response = new CheckoutResponseDto
            {
                OrderNumber = orderNumber,
                RazorpayOrderId = razorpayOrderId,
                Subtotal = subtotal,
                Discount = discount,
                ShippingFee = shippingFee,
                TotalAmount = totalAmount,
                Currency = "INR"
            };

            return Ok(ApiResponse<CheckoutResponseDto>.Ok(response, "Checkout initiated successfully."));
        }

        [HttpPost("verify-payment")]
        public async Task<ActionResult<ApiResponse<bool>>> VerifyPayment([FromBody] VerifyPaymentRequestDto request)
        {
            var isValid = _razorpayService.VerifyPaymentSignature(
                request.RazorpayOrderId,
                request.RazorpayPaymentId,
                request.RazorpaySignature);

            if (!isValid)
            {
                return BadRequest(ApiResponse<bool>.Fail("Razorpay cryptographic payment verification failed."));
            }

            var order = await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.OrderNumber == request.OrderNumber || o.Payments.Any(p => p.RazorpayOrderId == request.RazorpayOrderId));

            if (order == null)
            {
                return NotFound(ApiResponse<bool>.Fail("Order record not found."));
            }

            // Commit order and payment
            order.Status = OrderStatus.Confirmed;
            order.PaymentStatus = PaymentStatus.Paid;

            var payment = order.Payments.FirstOrDefault(p => p.RazorpayOrderId == request.RazorpayOrderId)
                          ?? order.Payments.FirstOrDefault();

            if (payment != null)
            {
                payment.RazorpayPaymentId = request.RazorpayPaymentId;
                payment.RazorpaySignature = request.RazorpaySignature;
                payment.Status = "Captured";
            }

            // Deduct stock permanently
            foreach (var item in order.Items)
            {
                var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.VariantId == item.VariantId);
                if (inventory != null)
                {
                    inventory.QuantityAvailable = Math.Max(0, inventory.QuantityAvailable - item.Quantity);
                    inventory.UpdatedAtUtc = DateTimeOffset.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<bool>.Ok(true, "Payment verified and order successfully confirmed!"));
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<OrderSummaryDto>>>> GetOrders()
        {
            var orders = await _context.Orders
                .OrderByDescending(o => o.PlacedAtUtc)
                .Select(o => new OrderSummaryDto
                {
                    OrderNumber = o.OrderNumber,
                    Date = o.PlacedAtUtc,
                    Status = o.Status.ToString(),
                    PaymentStatus = o.PaymentStatus.ToString(),
                    Total = o.TotalAmount,
                    CourierPartner = o.CourierPartner,
                    TrackingNumber = o.TrackingNumber,
                    EstimatedDelivery = o.EstimatedDeliveryUtc
                })
                .ToListAsync();

            return Ok(ApiResponse<List<OrderSummaryDto>>.Ok(orders));
        }
    }
}
