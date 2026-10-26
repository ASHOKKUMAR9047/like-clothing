using System;
using Microsoft.EntityFrameworkCore;
using FashionStore.Domain.Entities;

namespace FashionStore.Infrastructure.Data
{
    public class FashionStoreDbContext : DbContext
    {
        public FashionStoreDbContext(DbContextOptions<FashionStoreDbContext> options)
            : base(options)
        {
        }

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<ProductImage> ProductImages => Set<ProductImage>();
        public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
        public DbSet<Inventory> Inventories => Set<Inventory>();
        public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<PaymentWebhookEvent> PaymentWebhookEvents => Set<PaymentWebhookEvent>();
        public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Address> Addresses => Set<Address>();
        public DbSet<Coupon> Coupons => Set<Coupon>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<ShowcaseBanner> ShowcaseBanners => Set<ShowcaseBanner>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Category
            builder.Entity<Category>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.HasIndex(c => c.Slug).IsUnique();
                entity.Property(c => c.Name).HasMaxLength(150).IsRequired();
                entity.HasOne(c => c.Parent)
                      .WithMany(c => c.SubCategories)
                      .HasForeignKey(c => c.ParentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Product
            builder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.HasIndex(p => p.Sku).IsUnique();
                entity.HasIndex(p => p.Slug).IsUnique();
                entity.Property(p => p.Title).HasMaxLength(250).IsRequired();
                entity.Property(p => p.BasePrice).HasPrecision(18, 2);
                entity.Property(p => p.SalePrice).HasPrecision(18, 2);

                entity.HasOne(p => p.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(p => p.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Product Variant
            builder.Entity<ProductVariant>(entity =>
            {
                entity.HasKey(v => v.Id);
                entity.HasIndex(v => v.VariantSku).IsUnique();
                entity.Property(v => v.PriceAdjustment).HasPrecision(18, 2);

                entity.HasOne(v => v.Product)
                      .WithMany(p => p.Variants)
                      .HasForeignKey(v => v.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Inventory
            builder.Entity<Inventory>(entity =>
            {
                entity.HasKey(i => i.Id);
                entity.HasIndex(i => i.VariantId).IsUnique();

                entity.HasOne(i => i.Variant)
                      .WithOne(v => v.Inventory)
                      .HasForeignKey<Inventory>(i => i.VariantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Order & Financial Decimals
            builder.Entity<Order>(entity =>
            {
                entity.HasKey(o => o.Id);
                entity.HasIndex(o => o.OrderNumber).IsUnique();
                entity.Property(o => o.SubtotalAmount).HasPrecision(18, 2);
                entity.Property(o => o.DiscountAmount).HasPrecision(18, 2);
                entity.Property(o => o.ShippingFee).HasPrecision(18, 2);
                entity.Property(o => o.TotalAmount).HasPrecision(18, 2);

                entity.HasOne(o => o.ShippingAddress)
                      .WithMany()
                      .HasForeignKey(o => o.ShippingAddressId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(oi => oi.Id);
                entity.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
                entity.Property(oi => oi.LineTotal).HasPrecision(18, 2);

                entity.HasOne(oi => oi.Order)
                      .WithMany(o => o.Items)
                      .HasForeignKey(oi => oi.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Payment & Webhook Idempotency
            builder.Entity<Payment>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.HasIndex(p => p.RazorpayOrderId);
                entity.Property(p => p.Amount).HasPrecision(18, 2);

                entity.HasOne(p => p.Order)
                      .WithMany(o => o.Payments)
                      .HasForeignKey(p => p.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<PaymentWebhookEvent>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.EventId).IsUnique();
            });

            // User & Addresses
            builder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Email).HasMaxLength(200).IsRequired();
            });

            builder.Entity<Address>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.HasOne(a => a.User)
                      .WithMany(u => u.Addresses)
                      .HasForeignKey(a => a.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Coupon
            builder.Entity<Coupon>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.HasIndex(c => c.Code).IsUnique();
                entity.Property(c => c.DiscountValue).HasPrecision(18, 2);
                entity.Property(c => c.MinOrderAmount).HasPrecision(18, 2);
                entity.Property(c => c.MaxDiscountAmount).HasPrecision(18, 2);
            });
        }
    }
}
