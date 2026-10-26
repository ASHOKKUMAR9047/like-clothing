using System;
using System.Collections.Generic;

namespace FashionStore.Application.DTOs
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequestDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }

    public class LineItemRequestDto
    {
        public Guid VariantId { get; set; }
        public int Quantity { get; set; }
    }

    public class AddressDto
    {
        public string RecipientName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AddressType { get; set; } = "Home";
        public string StreetLine1 { get; set; } = string.Empty;
        public string? StreetLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = "Delhi";
        public string Pincode { get; set; } = string.Empty;
    }

    public class InitiateCheckoutRequestDto
    {
        public List<LineItemRequestDto> Items { get; set; } = new();
        public AddressDto ShippingAddress { get; set; } = new();
        public string? CouponCode { get; set; }
    }

    public class CheckoutResponseDto
    {
        public string OrderNumber { get; set; } = string.Empty;
        public string RazorpayOrderId { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "INR";
    }

    public class VerifyPaymentRequestDto
    {
        public string OrderNumber { get; set; } = string.Empty;
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string RazorpaySignature { get; set; } = string.Empty;
    }

    public class OrderSummaryDto
    {
        public string OrderNumber { get; set; } = string.Empty;
        public DateTimeOffset Date { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public string? CourierPartner { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTimeOffset? EstimatedDelivery { get; set; }
    }

    public class DashboardMetricsDto
    {
        public decimal TotalRevenue { get; set; }
        public int ActiveOrders { get; set; }
        public int TotalProducts { get; set; }
        public int LowStockAlerts { get; set; }
    }

    public class AdjustStockDto
    {
        public Guid VariantId { get; set; }
        public int QuantityDelta { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
