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

namespace FashionStore.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CatalogController : ControllerBase
    {
        private readonly FashionStoreDbContext _context;

        public CatalogController(FashionStoreDbContext context)
        {
            _context = context;
        }

        [HttpGet("categories")]
        public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description,
                    BannerImageUrl = c.BannerImageUrl,
                    ItemCount = c.Products.Count(p => p.IsActive)
                })
                .ToListAsync();

            return Ok(ApiResponse<List<CategoryDto>>.Ok(categories));
        }

        [HttpPost("categories")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(ApiResponse<CategoryDto>.Fail("Category name is required."));
            }

            var cleanName = request.Name.Trim();
            var slug = string.IsNullOrWhiteSpace(request.Slug)
                ? cleanName.ToLower().Replace(" ", "-").Replace("&", "and").Trim('-', ' ')
                : request.Slug.ToLower().Trim();

            var existing = await _context.Categories.FirstOrDefaultAsync(c => c.Slug == slug || c.Name.ToLower() == cleanName.ToLower());
            if (existing != null)
            {
                return Ok(ApiResponse<CategoryDto>.Ok(new CategoryDto
                {
                    Id = existing.Id,
                    Name = existing.Name,
                    Slug = existing.Slug,
                    Description = existing.Description,
                    BannerImageUrl = existing.BannerImageUrl,
                    ItemCount = existing.Products.Count(p => p.IsActive)
                }, "Category already exists."));
            }

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = cleanName,
                Slug = slug,
                Description = string.IsNullOrWhiteSpace(request.Description) ? $"{cleanName} - LIKE CLOTHING Virudhunagar" : request.Description,
                BannerImageUrl = request.BannerImageUrl ?? "",
                DisplayOrder = (await _context.Categories.CountAsync()) + 1,
                IsActive = true
            };

            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<CategoryDto>.Ok(new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                BannerImageUrl = category.BannerImageUrl,
                ItemCount = 0
            }, "Category created successfully."));
        }

        [HttpGet("debug-count")]
        public async Task<ActionResult> GetDebugCount()
        {
            var count = await _context.Products.CountAsync();
            var products = await _context.Products.Select(p => new { p.Id, p.Title, p.Slug, p.IsActive, p.CategoryId }).ToListAsync();
            return Ok(new { total = count, products });
        }

        private static bool _schemaChecked = false;
        private async Task EnsureSchemaAsync()
        {
            if (_schemaChecked) return;
            try
            {
                await _context.Database.ExecuteSqlRawAsync(@"
                    ALTER TABLE ""Products"" ADD COLUMN IF NOT EXISTS ""VideoUrl"" text;
                ");
                _schemaChecked = true;
            }
            catch { }
        }

        [HttpGet("products")]
        public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetProducts(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] string? size,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sort,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            await EnsureSchemaAsync();
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Inventory)
                .Where(p => p.IsActive)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(p =>
                    p.Title.ToLower().Contains(term) ||
                    p.Sku.ToLower().Contains(term) ||
                    p.FabricMaterial.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(category) && category != "all")
            {
                query = query.Where(p => p.Category.Slug == category);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => (p.SalePrice ?? p.BasePrice) >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => (p.SalePrice ?? p.BasePrice) <= maxPrice.Value);
            }

            if (!string.IsNullOrWhiteSpace(size))
            {
                query = query.Where(p => p.Variants.Any(v => v.Size == size && v.Inventory != null && v.Inventory.QuantityAvailable > 0));
            }

            query = sort switch
            {
                "price-asc" => query.OrderBy(p => p.SalePrice ?? p.BasePrice),
                "price-desc" => query.OrderByDescending(p => p.SalePrice ?? p.BasePrice),
                "rating" => query.OrderByDescending(p => p.AverageRating),
                "newest" => query.OrderByDescending(p => p.CreatedAtUtc),
                _ => query.OrderByDescending(p => p.IsFeatured)
            };

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Sku = p.Sku,
                    Title = p.Title,
                    Slug = p.Slug,
                    Category = p.Category.Name,
                    CategoryId = p.CategoryId,
                    Summary = p.Summary,
                    Description = p.Description,
                    Fabric = p.FabricMaterial,
                    CareInstructions = p.CareInstructions,
                    BasePrice = p.BasePrice,
                    SalePrice = p.SalePrice,
                    DiscountPercentage = p.DiscountPercentage,
                    IsFeatured = p.IsFeatured,
                    IsNewArrival = p.IsNewArrival,
                    IsBestSeller = p.IsBestSeller,
                    Rating = p.AverageRating,
                    ReviewCount = p.ReviewCount,
                    VideoUrl = p.VideoUrl,
                    Images = p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        Url = i.ImageUrl,
                        AltText = i.AltText,
                        IsPrimary = i.IsPrimary
                    }).ToList(),
                    Variants = p.Variants.Select(v => new ProductVariantDto
                    {
                        Id = v.Id,
                        Sku = v.VariantSku,
                        Size = v.Size,
                        ColorName = v.ColorName,
                        ColorHex = v.ColorHex,
                        PriceAdjustment = v.PriceAdjustment,
                        StockQuantity = v.Inventory != null ? v.Inventory.QuantityAvailable : 0
                    }).ToList()
                })
                .ToListAsync();

            return Ok(ApiResponse<List<ProductDto>>.Ok(items));
        }

        [HttpGet("products/{slug}")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> GetProductBySlug(string slug)
        {
            await EnsureSchemaAsync();
            var p = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Inventory)
                .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

            if (p == null)
            {
                return NotFound(ApiResponse<ProductDto>.Fail("Product ensemble not found."));
            }

            var dto = new ProductDto
            {
                Id = p.Id,
                Sku = p.Sku,
                Title = p.Title,
                Slug = p.Slug,
                Category = p.Category.Name,
                CategoryId = p.CategoryId,
                Summary = p.Summary,
                Description = p.Description,
                Fabric = p.FabricMaterial,
                CareInstructions = p.CareInstructions,
                BasePrice = p.BasePrice,
                SalePrice = p.SalePrice,
                DiscountPercentage = p.DiscountPercentage,
                IsFeatured = p.IsFeatured,
                IsNewArrival = p.IsNewArrival,
                IsBestSeller = p.IsBestSeller,
                Rating = p.AverageRating,
                ReviewCount = p.ReviewCount,
                VideoUrl = p.VideoUrl,
                Images = p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ProductImageDto
                {
                    Id = i.Id,
                    Url = i.ImageUrl,
                    AltText = i.AltText,
                    IsPrimary = i.IsPrimary
                }).ToList(),
                Variants = p.Variants.Select(v => new ProductVariantDto
                {
                    Id = v.Id,
                    Sku = v.VariantSku,
                    Size = v.Size,
                    ColorName = v.ColorName,
                    ColorHex = v.ColorHex,
                    PriceAdjustment = v.PriceAdjustment,
                    StockQuantity = v.Inventory != null ? v.Inventory.QuantityAvailable : 0
                }).ToList()
            };

            return Ok(ApiResponse<ProductDto>.Ok(dto));
        }

        [HttpGet("products/featured")]
        public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetFeatured()
        {
            return await GetProducts(null, null, null, null, null, "featured", 1, 8);
        }

        [HttpPost("products")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> CreateProduct([FromBody] CreateProductRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(ApiResponse<ProductDto>.Fail("Title is required."));
            }

            var category = (request.CategoryId.HasValue ? await _context.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId.Value) : null)
                ?? await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == request.Category.ToLower() || c.Slug.ToLower() == request.Category.ToLower());

            if (category == null && !string.IsNullOrWhiteSpace(request.Category))
            {
                var cleanCatName = request.Category.Trim();
                var catSlug = cleanCatName.ToLower().Replace(" ", "-").Replace("&", "and").Trim('-', ' ');
                category = new Category
                {
                    Id = Guid.NewGuid(),
                    Name = cleanCatName,
                    Slug = catSlug,
                    Description = $"{cleanCatName} - LIKE CLOTHING Virudhunagar",
                    IsActive = true,
                    DisplayOrder = (await _context.Categories.CountAsync()) + 1
                };
                await _context.Categories.AddAsync(category);
                await _context.SaveChangesAsync();
            }

            if (category == null)
            {
                category = await _context.Categories.FirstOrDefaultAsync() ?? new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "General",
                    Slug = "general",
                    Description = "General Men's Wear",
                    IsActive = true,
                    DisplayOrder = 1
                };
            }

            var baseSlug = request.Title.ToLower()
                .Replace(" ", "-")
                .Replace("&", "and")
                .Trim('-', ' ');

            var finalSlug = $"{baseSlug}-{Random.Shared.Next(100, 999)}";

            var product = new Product
            {
                Id = Guid.NewGuid(),
                CategoryId = category.Id,
                Sku = string.IsNullOrWhiteSpace(request.Sku) ? $"LC-{Random.Shared.Next(100, 999)}" : request.Sku,
                Title = request.Title,
                Slug = finalSlug,
                Summary = string.IsNullOrWhiteSpace(request.Summary) ? request.Title : request.Summary,
                Description = string.IsNullOrWhiteSpace(request.Description) ? request.Title : request.Description,
                FabricMaterial = string.IsNullOrWhiteSpace(request.Fabric) ? "100% Combed Cotton" : request.Fabric,
                CareInstructions = string.IsNullOrWhiteSpace(request.CareInstructions) ? "Machine wash cold inside out." : request.CareInstructions,
                BasePrice = request.BasePrice,
                SalePrice = request.SalePrice ?? request.BasePrice,
                DiscountPercentage = request.DiscountPercentage ?? 0,
                IsFeatured = request.IsFeatured,
                IsNewArrival = request.IsNewArrival,
                IsBestSeller = request.IsBestSeller,
                AverageRating = 5.0,
                ReviewCount = 1,
                VideoUrl = request.VideoUrl,
                IsActive = true,
                CreatedAtUtc = DateTimeOffset.UtcNow,
                UpdatedAtUtc = DateTimeOffset.UtcNow
            };

            int imgOrder = 1;
            foreach (var img in request.Images)
            {
                product.Images.Add(new ProductImage
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    ImageUrl = img.Url,
                    AltText = string.IsNullOrWhiteSpace(img.AltText) ? product.Title : img.AltText,
                    DisplayOrder = imgOrder++,
                    IsPrimary = img.IsPrimary
                });
            }


            int varIndex = 1;
            foreach (var v in request.Variants)
            {
                var colorCode = string.IsNullOrWhiteSpace(v.ColorName) ? "DEF" : new string(v.ColorName.Where(char.IsLetterOrDigit).Take(3).ToArray()).ToUpper();
                var baseVariantSku = string.IsNullOrWhiteSpace(v.Sku) ? $"{product.Sku}-{colorCode}-{v.Size}" : v.Sku;
                var finalVariantSku = baseVariantSku;
                int suffix = 1;
                while (await _context.ProductVariants.AnyAsync(pv => pv.VariantSku == finalVariantSku))
                {
                    finalVariantSku = $"{baseVariantSku}-{suffix++}";
                }

                var variant = new ProductVariant
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    VariantSku = finalVariantSku,
                    Size = v.Size,
                    ColorName = string.IsNullOrWhiteSpace(v.ColorName) ? "Jet Black" : v.ColorName,
                    ColorHex = string.IsNullOrWhiteSpace(v.ColorHex) ? "#111111" : v.ColorHex,
                    PriceAdjustment = v.PriceAdjustment,
                    IsActive = true,
                    Inventory = new Inventory
                    {
                        Id = Guid.NewGuid(),
                        QuantityAvailable = v.StockQuantity >= 0 ? v.StockQuantity : 0,
                        QuantityReserved = 0,
                        LowStockThreshold = 2,
                        UpdatedAtUtc = DateTimeOffset.UtcNow
                    }
                };
                product.Variants.Add(variant);
            }

            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();

            var dto = new ProductDto
            {
                Id = product.Id,
                Sku = product.Sku,
                Title = product.Title,
                Slug = product.Slug,
                Category = category.Name,
                CategoryId = category.Id,
                Summary = product.Summary,
                Description = product.Description,
                Fabric = product.FabricMaterial,
                CareInstructions = product.CareInstructions,
                BasePrice = product.BasePrice,
                SalePrice = product.SalePrice,
                DiscountPercentage = product.DiscountPercentage,
                IsFeatured = product.IsFeatured,
                IsNewArrival = product.IsNewArrival,
                IsBestSeller = product.IsBestSeller,
                Rating = product.AverageRating,
                ReviewCount = product.ReviewCount,
                VideoUrl = product.VideoUrl,
                Images = product.Images.Select(i => new ProductImageDto { Id = i.Id, Url = i.ImageUrl, AltText = i.AltText, IsPrimary = i.IsPrimary }).ToList(),
                Variants = product.Variants.Select(v => new ProductVariantDto { Id = v.Id, Sku = v.VariantSku, Size = v.Size, ColorName = v.ColorName, ColorHex = v.ColorHex, PriceAdjustment = v.PriceAdjustment, StockQuantity = v.Inventory?.QuantityAvailable ?? 0 }).ToList()
            };

            return Ok(ApiResponse<ProductDto>.Ok(dto, "Product saved successfully."));
        }

        [HttpPut("products/{id}")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProduct(Guid id, [FromBody] CreateProductRequest request)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Inventory)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(ApiResponse<ProductDto>.Fail("Product not found."));
            }

            // Update basic fields
            if (!string.IsNullOrWhiteSpace(request.Title)) product.Title = request.Title;
            if (!string.IsNullOrWhiteSpace(request.Summary)) product.Summary = request.Summary;
            if (!string.IsNullOrWhiteSpace(request.Description)) product.Description = request.Description;
            if (!string.IsNullOrWhiteSpace(request.Fabric)) product.FabricMaterial = request.Fabric;
            if (!string.IsNullOrWhiteSpace(request.CareInstructions)) product.CareInstructions = request.CareInstructions;
            if (request.VideoUrl != null) product.VideoUrl = request.VideoUrl;

            // Update Price and Discounts in PostgreSQL
            product.BasePrice = request.BasePrice;
            product.SalePrice = request.SalePrice ?? request.BasePrice;
            product.DiscountPercentage = request.DiscountPercentage ?? 0;

            product.IsFeatured = request.IsFeatured;
            product.IsNewArrival = request.IsNewArrival;
            product.IsBestSeller = request.IsBestSeller;
            product.UpdatedAtUtc = DateTimeOffset.UtcNow;

            // Update Category if changed
            if (request.CategoryId.HasValue && request.CategoryId.Value != Guid.Empty && request.CategoryId.Value != product.CategoryId)
            {
                var cat = await _context.Categories.FindAsync(request.CategoryId.Value);
                if (cat != null)
                {
                    product.CategoryId = cat.Id;
                    product.Category = cat;
                }
            }

            // Update Images in place
            if (request.Images != null && request.Images.Count > 0)
            {
                var existingImages = product.Images.ToList();
                int imgOrder = 1;
                for (int i = 0; i < request.Images.Count; i++)
                {
                    var imgReq = request.Images[i];
                    if (i < existingImages.Count)
                    {
                        var existingImg = existingImages[i];
                        existingImg.ImageUrl = imgReq.Url;
                        existingImg.AltText = string.IsNullOrWhiteSpace(imgReq.AltText) ? product.Title : imgReq.AltText;
                        existingImg.DisplayOrder = imgOrder++;
                        existingImg.IsPrimary = imgReq.IsPrimary;
                    }
                    else
                    {
                        product.Images.Add(new ProductImage
                        {
                            Id = Guid.NewGuid(),
                            ProductId = product.Id,
                            ImageUrl = imgReq.Url,
                            AltText = string.IsNullOrWhiteSpace(imgReq.AltText) ? product.Title : imgReq.AltText,
                            DisplayOrder = imgOrder++,
                            IsPrimary = imgReq.IsPrimary
                        });
                    }
                }
            }

            // Update Variants and Stocks in place (Support full multi-color palettes)
            if (request.Variants != null && request.Variants.Count > 0)
            {
                var incomingVariants = request.Variants;

                // 1. Remove variants that are no longer in the request
                var toRemove = product.Variants
                    .Where(existing => !incomingVariants.Any(iv => iv.Size == existing.Size && iv.ColorName == existing.ColorName))
                    .ToList();
                foreach (var rem in toRemove)
                {
                    _context.ProductVariants.Remove(rem);
                }

                // 2. Update existing or add new
                foreach (var vReq in incomingVariants)
                {
                    var existing = product.Variants.FirstOrDefault(v => v.Size == vReq.Size && v.ColorName == vReq.ColorName);
                    if (existing != null)
                    {
                        existing.ColorHex = string.IsNullOrWhiteSpace(vReq.ColorHex) ? existing.ColorHex : vReq.ColorHex;
                        existing.PriceAdjustment = vReq.PriceAdjustment;
                        if (existing.Inventory != null)
                        {
                            existing.Inventory.QuantityAvailable = vReq.StockQuantity >= 0 ? vReq.StockQuantity : 0;
                            existing.Inventory.UpdatedAtUtc = DateTimeOffset.UtcNow;
                        }
                    }
                    else
                    {
                        var colorCode = string.IsNullOrWhiteSpace(vReq.ColorName) ? "DEF" : new string(vReq.ColorName.Where(char.IsLetterOrDigit).Take(3).ToArray()).ToUpper();
                        var finalSku = $"{product.Sku}-{colorCode}-{vReq.Size}";
                        var newVariant = new ProductVariant
                        {
                            Id = Guid.NewGuid(),
                            ProductId = product.Id,
                            VariantSku = finalSku,
                            Size = vReq.Size,
                            ColorName = string.IsNullOrWhiteSpace(vReq.ColorName) ? "Jet Black" : vReq.ColorName,
                            ColorHex = string.IsNullOrWhiteSpace(vReq.ColorHex) ? "#111111" : vReq.ColorHex,
                            PriceAdjustment = vReq.PriceAdjustment,
                            IsActive = true,
                            Inventory = new Inventory
                            {
                                Id = Guid.NewGuid(),
                                QuantityAvailable = vReq.StockQuantity >= 0 ? vReq.StockQuantity : 0,
                                QuantityReserved = 0,
                                LowStockThreshold = 2,
                                UpdatedAtUtc = DateTimeOffset.UtcNow
                            }
                        };
                        product.Variants.Add(newVariant);
                    }
                }
            }

            await _context.SaveChangesAsync();

            var dto = new ProductDto
            {
                Id = product.Id,
                Sku = product.Sku,
                Title = product.Title,
                Slug = product.Slug,
                Category = product.Category?.Name ?? "Apparel",
                CategoryId = product.CategoryId,
                Summary = product.Summary,
                Description = product.Description,
                Fabric = product.FabricMaterial,
                CareInstructions = product.CareInstructions,
                BasePrice = product.BasePrice,
                SalePrice = product.SalePrice,
                DiscountPercentage = product.DiscountPercentage,
                IsFeatured = product.IsFeatured,
                IsNewArrival = product.IsNewArrival,
                IsBestSeller = product.IsBestSeller,
                Rating = product.AverageRating,
                ReviewCount = product.ReviewCount,
                VideoUrl = product.VideoUrl,
                Images = product.Images.Select(i => new ProductImageDto { Id = i.Id, Url = i.ImageUrl, AltText = i.AltText, IsPrimary = i.IsPrimary }).ToList(),
                Variants = product.Variants.Select(v => new ProductVariantDto { Id = v.Id, Sku = v.VariantSku, Size = v.Size, ColorName = v.ColorName, ColorHex = v.ColorHex, PriceAdjustment = v.PriceAdjustment, StockQuantity = v.Inventory?.QuantityAvailable ?? 0 }).ToList()
            };

            return Ok(ApiResponse<ProductDto>.Ok(dto, "Product updated successfully."));
        }

        [HttpDelete("products/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteProduct(Guid id)
        {
            var p = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Inventory)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (p == null) return NotFound(ApiResponse<bool>.Fail("Product not found."));

            _context.ProductImages.RemoveRange(p.Images);
            foreach (var v in p.Variants)
            {
                if (v.Inventory != null) _context.Inventories.Remove(v.Inventory);
            }
            _context.ProductVariants.RemoveRange(p.Variants);
            _context.Products.Remove(p);

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Ok(true, "Product deleted successfully."));
        }

        [HttpPost("upload-image")]
        public async Task<ActionResult<ApiResponse<string>>> UploadImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<string>.Fail("No file uploaded."));
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".avif" };
            var ext = System.IO.Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
            {
                return BadRequest(ApiResponse<string>.Fail("Only image files (.jpg, .jpeg, .png, .webp, .avif) are permitted."));
            }

            // High-Speed Instant Storage (< 20ms) directly to server static directory
            var uploadsFolder = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!System.IO.Directory.Exists(uploadsFolder))
            {
                System.IO.Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = System.IO.Path.Combine(uploadsFolder, fileName);

            using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var req = HttpContext.Request;
            var fileUrl = $"{req.Scheme}://{req.Host}/uploads/{fileName}";

            return Ok(ApiResponse<string>.Ok(fileUrl, "Image uploaded instantly."));
        }

        // GET /api/v1/catalog/showcase-banners
        [HttpGet("showcase-banners")]
        public async Task<ActionResult<ApiResponse<List<ShowcaseBanner>>>> GetShowcaseBanners()
        {
            try
            {
                // Ensure ShowcaseBanners table exists in PostgreSQL
                await _context.Database.ExecuteSqlRawAsync(@"
                    CREATE TABLE IF NOT EXISTS ""ShowcaseBanners"" (
                        ""Id"" uuid NOT NULL PRIMARY KEY,
                        ""Title"" text NOT NULL,
                        ""Subtitle"" text NOT NULL,
                        ""BadgeLeft"" text NOT NULL,
                        ""BadgeRight"" text NOT NULL,
                        ""ImageUrl"" text NOT NULL,
                        ""CategorySlug"" text NOT NULL,
                        ""DisplayOrder"" integer NOT NULL,
                        ""IsActive"" boolean NOT NULL,
                        ""CreatedAtUtc"" timestamp with time zone NOT NULL
                    );
                ");

                var banners = await _context.ShowcaseBanners
                    .Where(b => b.IsActive)
                    .OrderBy(b => b.DisplayOrder)
                    .ToListAsync();

                if (banners.Count == 0)
                {
                    var defaults = new List<ShowcaseBanner>
                    {
                        new ShowcaseBanner
                        {
                            Id = Guid.NewGuid(),
                            Title = "OVERSIZED TEES",
                            Subtitle = "Graphic, Plain & Acid-Wash Drips",
                            BadgeLeft = "240 GSM COTTON",
                            BadgeRight = "OVERSIZED",
                            CategorySlug = "oversized-tees",
                            ImageUrl = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
                            DisplayOrder = 1
                        },
                        new ShowcaseBanner
                        {
                            Id = Guid.NewGuid(),
                            Title = "SHIRTS & POLOS",
                            Subtitle = "European Linen & Oxford Fits",
                            BadgeLeft = "PURE LINEN",
                            BadgeRight = "CUBAN COLLAR",
                            CategorySlug = "shirts",
                            ImageUrl = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop",
                            DisplayOrder = 2
                        },
                        new ShowcaseBanner
                        {
                            Id = Guid.NewGuid(),
                            Title = "CARGOS & DENIM",
                            Subtitle = "Tactical Streetwear & Relaxed Denim",
                            BadgeLeft = "HOT FIT",
                            BadgeRight = "6-POCKETS",
                            CategorySlug = "cargos-denim",
                            ImageUrl = "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop",
                            DisplayOrder = 3
                        }
                    };
                    await _context.ShowcaseBanners.AddRangeAsync(defaults);
                    await _context.SaveChangesAsync();
                    return Ok(ApiResponse<List<ShowcaseBanner>>.Ok(defaults));
                }

                return Ok(ApiResponse<List<ShowcaseBanner>>.Ok(banners));
            }
            catch (Exception ex)
            {
                return Ok(ApiResponse<List<ShowcaseBanner>>.Fail($"Error: {ex.Message}"));
            }
        }

        // POST /api/v1/catalog/showcase-banners
        [HttpPost("showcase-banners")]
        public async Task<ActionResult<ApiResponse<ShowcaseBanner>>> SaveShowcaseBanner([FromBody] ShowcaseBanner request)
        {
            if (string.IsNullOrWhiteSpace(request.ImageUrl) || string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(ApiResponse<ShowcaseBanner>.Fail("Title and ImageUrl are required."));
            }

            var existing = request.Id != Guid.Empty ? await _context.ShowcaseBanners.FindAsync(request.Id) : null;
            if (existing != null)
            {
                existing.Title = request.Title;
                existing.Subtitle = request.Subtitle ?? "";
                existing.BadgeLeft = request.BadgeLeft ?? "";
                existing.BadgeRight = request.BadgeRight ?? "";
                existing.ImageUrl = request.ImageUrl;
                existing.CategorySlug = request.CategorySlug ?? "all";
                existing.DisplayOrder = request.DisplayOrder;
                existing.IsActive = request.IsActive;
                await _context.SaveChangesAsync();
                return Ok(ApiResponse<ShowcaseBanner>.Ok(existing, "Banner updated in database."));
            }

            var newBanner = new ShowcaseBanner
            {
                Id = request.Id != Guid.Empty ? request.Id : Guid.NewGuid(),
                Title = request.Title,
                Subtitle = request.Subtitle ?? "",
                BadgeLeft = request.BadgeLeft ?? "",
                BadgeRight = request.BadgeRight ?? "",
                ImageUrl = request.ImageUrl,
                CategorySlug = request.CategorySlug ?? "all",
                DisplayOrder = request.DisplayOrder > 0 ? request.DisplayOrder : (await _context.ShowcaseBanners.CountAsync()) + 1,
                IsActive = true,
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            await _context.ShowcaseBanners.AddAsync(newBanner);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<ShowcaseBanner>.Ok(newBanner, "Banner created in database."));
        }

        // DELETE /api/v1/catalog/showcase-banners/{id}
        [HttpDelete("showcase-banners/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteShowcaseBanner(Guid id)
        {
            var banner = await _context.ShowcaseBanners.FindAsync(id);
            if (banner == null)
            {
                return NotFound(ApiResponse<bool>.Fail("Banner not found."));
            }

            _context.ShowcaseBanners.Remove(banner);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Ok(true, "Banner deleted from database."));
        }
    }
}
