using System;

namespace FashionStore.Domain.Entities
{
    public class Inventory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid VariantId { get; set; }
        public int QuantityAvailable { get; set; }
        public int QuantityReserved { get; set; }
        public int LowStockThreshold { get; set; } = 3;
        public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

        public ProductVariant Variant { get; set; } = null!;
    }

    public class InventoryTransaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid VariantId { get; set; }
        public Guid? OrderId { get; set; }
        public string TransactionType { get; set; } = string.Empty; // Restock, Reservation, Deduction, Release, Adjustment
        public int QuantityDelta { get; set; }
        public int BalanceAfter { get; set; }
        public string Reason { get; set; } = string.Empty;
        public Guid? PerformedByUserId { get; set; }
        public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

        public ProductVariant Variant { get; set; } = null!;
    }
}
