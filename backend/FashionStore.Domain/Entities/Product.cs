using System;
using System.Collections.Generic;

namespace FashionStore.Domain.Entities
{
    public class Product
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CategoryId { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string FabricMaterial { get; set; } = string.Empty;
        public string CareInstructions { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public decimal? SalePrice { get; set; }
        public int? DiscountPercentage { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsBestSeller { get; set; }
        public bool IsActive { get; set; } = true;
        public double AverageRating { get; set; } = 5.0;
        public int ReviewCount { get; set; } = 0;
        public string? VideoUrl { get; set; }
        public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

        // Navigation properties
        public Category Category { get; set; } = null!;
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }

    public class ProductImage
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProductId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string AltText { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; }

        public Product Product { get; set; } = null!;
    }

    public class ProductVariant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProductId { get; set; }
        public string VariantSku { get; set; } = string.Empty;
        public string Size { get; set; } = "M"; // XS, S, M, L, XL, XXL, FreeSize
        public string ColorName { get; set; } = string.Empty;
        public string ColorHex { get; set; } = string.Empty;
        public decimal PriceAdjustment { get; set; } = 0m;
        public bool IsActive { get; set; } = true;

        public Product Product { get; set; } = null!;
        public Inventory? Inventory { get; set; }
    }
}
