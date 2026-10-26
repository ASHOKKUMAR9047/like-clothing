using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FashionStore.Domain.Entities;

namespace FashionStore.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(FashionStoreDbContext context)
        {
            await context.Database.EnsureCreatedAsync();


            // 1. Auto-seed essential store categories if table is empty
            if (!await context.Categories.AnyAsync())
            {
                var defaultCategories = new (string Name, string Slug)[]
                {
                    ("Oversized & Graphic Tees", "oversized-tees"),
                    ("Casual & Oxford Shirts", "shirts"),
                    ("Cargo Pants & Denim", "cargos-denim"),
                    ("Sneakers & Streetwear Shoes", "sneakers-shoes"),
                    ("Hoodies & Streetwear Jackets", "hoodies-jackets"),
                    ("Polos & Classic Fits", "polos"),
                    ("Co-ords & Streetwear Sets", "coords-sets"),
                    ("Men Festive Kurtas & Nehru Sets", "mens-ethnic")
                };

                int order = 1;
                foreach (var item in defaultCategories)
                {
                    await context.Categories.AddAsync(new Category
                    {
                        Id = Guid.NewGuid(),
                        Name = item.Name,
                        Slug = item.Slug,
                        Description = $"{item.Name} - LIKE CLOTHING Virudhunagar",
                        DisplayOrder = order++
                    });
                }
                await context.SaveChangesAsync();
            }

            // Ensure categories use 100% men model banner images
            var ethnicCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "mens-ethnic");
            if (ethnicCat != null)
            {
                ethnicCat.BannerImageUrl = "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop";
            }
            var coordsCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "coords-sets");
            if (coordsCat != null)
            {
                coordsCat.BannerImageUrl = "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800&auto=format&fit=crop";
            }
            await context.SaveChangesAsync();

            // 2. Seed Store Admin User
            if (!await context.Users.AnyAsync(u => u.Email == "admin@likeclothing.com"))
            {
                var adminUser = new User
                {
                    Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                    FullName = "Store Manager (LIKE CLOTHING)",
                    Email = "admin@likeclothing.com",
                    PasswordHash = "AQAAAAIAAYagAAAAEOc9...", // PBKDF2 hash representation
                    PhoneNumber = "+91 98401 23456",
                    Role = "Admin"
                };

                await context.Users.AddAsync(adminUser);
            }

            // 3. Seed Coupons
            if (!await context.Coupons.AnyAsync())
            {
                var couponLike = new Coupon
                {
                    Code = "LIKE20",
                    DiscountType = "Percentage",
                    DiscountValue = 20m,
                    MinOrderAmount = 999m,
                    MaxDiscountAmount = 2000m,
                    UsageLimitTotal = 10000,
                    IsActive = true
                };

                var couponUpdate = new Coupon
                {
                    Code = "UPDATE10",
                    DiscountType = "Percentage",
                    DiscountValue = 10m,
                    MinOrderAmount = 499m,
                    UsageLimitTotal = 10000,
                    IsActive = true
                };

                await context.Coupons.AddRangeAsync(couponLike, couponUpdate);
            }

            await context.SaveChangesAsync();
        }
    }
}
