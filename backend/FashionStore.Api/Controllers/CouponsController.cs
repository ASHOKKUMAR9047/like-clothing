using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FashionStore.Application.Common;
using FashionStore.Domain.Entities;
using FashionStore.Infrastructure.Data;

namespace FashionStore.Api.Controllers
{
    public class CouponDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercent { get; set; }
        public decimal MinOrderValue { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class CreateCouponRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercent { get; set; }
        public decimal MinOrderValue { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }

    [ApiController]
    [Route("api/v1/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly FashionStoreDbContext _context;

        public CouponsController(FashionStoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<CouponDto>>>> GetCoupons()
        {
            var coupons = await _context.Coupons
                .OrderByDescending(c => c.ValidFromUtc)
                .ToListAsync();

            var dtos = coupons.Select(c => new CouponDto
            {
                Id = c.Id,
                Code = c.Code,
                DiscountPercent = c.DiscountValue,
                MinOrderValue = c.MinOrderAmount,
                Description = $"{c.DiscountValue}% off store discount",
                IsActive = c.IsActive
            }).ToList();

            return Ok(ApiResponse<List<CouponDto>>.Ok(dtos));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<CouponDto>>> CreateCoupon([FromBody] CreateCouponRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(ApiResponse<CouponDto>.Fail("Coupon code is required."));
            }

            var cleanCode = request.Code.Trim().ToUpperInvariant();
            var existing = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == cleanCode);
            if (existing != null)
            {
                existing.DiscountValue = request.DiscountPercent;
                existing.MinOrderAmount = request.MinOrderValue;
                existing.IsActive = request.IsActive;
                await _context.SaveChangesAsync();

                var updatedDto = new CouponDto
                {
                    Id = existing.Id,
                    Code = existing.Code,
                    DiscountPercent = existing.DiscountValue,
                    MinOrderValue = existing.MinOrderAmount,
                    Description = request.Description ?? $"{existing.DiscountValue}% discount",
                    IsActive = existing.IsActive
                };
                return Ok(ApiResponse<CouponDto>.Ok(updatedDto, "Coupon updated successfully."));
            }

            var coupon = new Coupon
            {
                Id = Guid.NewGuid(),
                Code = cleanCode,
                DiscountType = "Percentage",
                DiscountValue = request.DiscountPercent > 0 ? request.DiscountPercent : 10,
                MinOrderAmount = request.MinOrderValue,
                MaxDiscountAmount = null,
                UsageLimitTotal = 1000,
                UsageCount = 0,
                ValidFromUtc = DateTimeOffset.UtcNow,
                ValidUntilUtc = DateTimeOffset.UtcNow.AddMonths(12),
                IsActive = request.IsActive
            };

            await _context.Coupons.AddAsync(coupon);
            await _context.SaveChangesAsync();

            var dto = new CouponDto
            {
                Id = coupon.Id,
                Code = coupon.Code,
                DiscountPercent = coupon.DiscountValue,
                MinOrderValue = coupon.MinOrderAmount,
                Description = request.Description ?? $"{coupon.DiscountValue}% discount",
                IsActive = coupon.IsActive
            };

            return Ok(ApiResponse<CouponDto>.Ok(dto, "Coupon created successfully."));
        }

        [HttpPut("{id}/toggle")]
        public async Task<ActionResult<ApiResponse<bool>>> ToggleCoupon(Guid id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
            {
                return NotFound(ApiResponse<bool>.Fail("Coupon not found."));
            }

            coupon.IsActive = !coupon.IsActive;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<bool>.Ok(coupon.IsActive, $"Coupon {coupon.Code} is now {(coupon.IsActive ? "active" : "inactive")}."));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteCoupon(Guid id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
            {
                return NotFound(ApiResponse<bool>.Fail("Coupon not found."));
            }

            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<bool>.Ok(true, "Coupon deleted successfully."));
        }
    }
}
