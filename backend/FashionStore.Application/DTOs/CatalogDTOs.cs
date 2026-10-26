using System;
using System.Collections.Generic;

namespace FashionStore.Application.DTOs
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string BannerImageUrl { get; set; } = string.Empty;
        public int ItemCount { get; set; }
    }

    public class ProductVariantDto
    {
        public Guid Id { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string ColorName { get; set; } = string.Empty;
        public string ColorHex { get; set; } = string.Empty;
        public decimal PriceAdjustment { get; set; }
        public int StockQuantity { get; set; }
    }

    public class ProductImageDto
    {
        public Guid Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string AltText { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public string Summary { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Fabric { get; set; } = string.Empty;
        public string CareInstructions { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public decimal? SalePrice { get; set; }
        public int? DiscountPercentage { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsBestSeller { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public string? VideoUrl { get; set; }
        public List<ProductImageDto> Images { get; set; } = new();
        public List<ProductVariantDto> Variants { get; set; } = new();
    }

    public class CreateProductRequest
    {
        public string Sku { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public Guid? CategoryId { get; set; }
        public string Summary { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Fabric { get; set; } = string.Empty;
        public string CareInstructions { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public decimal? SalePrice { get; set; }
        public int? DiscountPercentage { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsBestSeller { get; set; }
        public string? VideoUrl { get; set; }
        public List<CreateProductImageRequest> Images { get; set; } = new();
        public List<CreateProductVariantRequest> Variants { get; set; } = new();
    }

    public class CreateProductImageRequest
    {
        public string Url { get; set; } = string.Empty;
        public string AltText { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }

    public class CreateProductVariantRequest
    {
        public string Sku { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string ColorName { get; set; } = string.Empty;
        public string ColorHex { get; set; } = string.Empty;
        public decimal PriceAdjustment { get; set; }
        public int StockQuantity { get; set; }
    }

    public class CreateCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? BannerImageUrl { get; set; }
    }
}
