using System;
using System.Collections.Generic;

namespace FashionStore.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = "Customer"; // Customer, Admin, SuperAdmin
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

        public ICollection<Address> Addresses { get; set; } = new List<Address>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }

    public class Address
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string RecipientName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AddressType { get; set; } = "Home"; // Home, Work, Other
        public string StreetLine1 { get; set; } = string.Empty;
        public string? StreetLine2 { get; set; }
        public string? Landmark { get; set; }
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = "Delhi";
        public string Pincode { get; set; } = string.Empty;
        public bool IsDefault { get; set; }

        public User User { get; set; } = null!;
    }

    public class Coupon
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Code { get; set; } = string.Empty;
        public string DiscountType { get; set; } = "Percentage"; // Percentage, Flat
        public decimal DiscountValue { get; set; }
        public decimal MinOrderAmount { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public DateTimeOffset ValidFromUtc { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset ValidUntilUtc { get; set; } = DateTimeOffset.UtcNow.AddMonths(3);
        public int UsageLimitTotal { get; set; } = 1000;
        public int UsageCount { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }

    public class Review
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProductId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Rating { get; set; } = 5;
        public string Title { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public bool IsVerifiedBuyer { get; set; } = true;
        public bool IsApproved { get; set; } = true;
        public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

        public Product Product { get; set; } = null!;
    }

    public class AuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string ChangesJson { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public DateTimeOffset TimestampUtc { get; set; } = DateTimeOffset.UtcNow;
    }
}
