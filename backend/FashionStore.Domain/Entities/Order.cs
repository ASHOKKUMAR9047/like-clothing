using System;
using System.Collections.Generic;

namespace FashionStore.Domain.Entities
{
    public enum OrderStatus
    {
        Placed,
        Confirmed,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }

    public enum PaymentStatus
    {
        Pending,
        Paid,
        Failed,
        Refunded
    }

    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string OrderNumber { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public Guid ShippingAddressId { get; set; }
        public decimal SubtotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Placed;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        public string? CourierPartner { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTimeOffset? EstimatedDeliveryUtc { get; set; }
        public DateTimeOffset PlacedAtUtc { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

        // Navigation
        public Address ShippingAddress { get; set; } = null!;
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
    }

    public class OrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public Guid VariantId { get; set; }
        public string ProductTitleSnapshot { get; set; } = string.Empty;
        public string VariantSkuSnapshot { get; set; } = string.Empty;
        public string SizeSnapshot { get; set; } = string.Empty;
        public string ColorSnapshot { get; set; } = string.Empty;
        public string PrimaryImageSnapshot { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }

        public Order Order { get; set; } = null!;
    }

    public class Payment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpaySignature { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string Status { get; set; } = "Created"; // Created, Authorized, Captured, Failed
        public string? FailureReason { get; set; }
        public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

        public Order Order { get; set; } = null!;
    }

    public class PaymentWebhookEvent
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string EventId { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string RawPayload { get; set; } = string.Empty;
        public string ProcessingStatus { get; set; } = "PROCESSED"; // PROCESSED, FAILED, IGNORED
        public DateTimeOffset ReceivedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    }

    public class OrderStatusHistory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public Guid? UpdatedByUserId { get; set; }
        public DateTimeOffset TimestampUtc { get; set; } = DateTimeOffset.UtcNow;

        public Order Order { get; set; } = null!;
    }
}
