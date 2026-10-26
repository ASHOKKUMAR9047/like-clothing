# Database Design & Entity Relationship Specification

## 1. Relational Schema Overview

The database is designed with standard 3NF normalization, enforcing referential integrity with cascading constraints where appropriate and audit logging on core financial and inventory operations.

All monetary amounts are stored as `DECIMAL(18, 2)` (or `NUMERIC(18, 2)` in PostgreSQL) to prevent IEEE floating-point precision loss. All timestamps are strictly UTC (`DateTimeOffset` in C# / `timestamptz` in SQL).

---

## 2. Mermaid Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ ADDRESSES : "has many"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ CARTS : "owns"
    USERS ||--o{ WISHLISTS : "owns"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ AUDIT_LOGS : "triggers"

    CATEGORIES ||--o{ CATEGORIES : "parent of"
    CATEGORIES ||--o{ PRODUCTS : "contains"

    PRODUCTS ||--o{ PRODUCT_IMAGES : "has many"
    PRODUCTS ||--o{ PRODUCT_VARIANTS : "has many"
    PRODUCTS ||--o{ REVIEWS : "receives"

    PRODUCT_VARIANTS ||--o{ INVENTORY : "tracked in"
    PRODUCT_VARIANTS ||--o{ INVENTORY_TRANSACTIONS : "audits"
    PRODUCT_VARIANTS ||--o{ CART_ITEMS : "added to"
    PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : "sold in"
    PRODUCT_VARIANTS ||--o{ WISHLIST_ITEMS : "saved in"

    CARTS ||--o{ CART_ITEMS : "contains"
    WISHLISTS ||--o{ WISHLIST_ITEMS : "contains"

    ORDERS ||--o{ ORDER_ITEMS : "includes"
    ORDERS ||--o{ PAYMENTS : "paid via"
    ORDERS ||--o{ SHIPMENTS : "dispatched as"
    ORDERS ||--o{ ORDER_STATUS_HISTORY : "tracks"
    ORDERS ||--o{ RETURNS_REFUNDS : "generates"

    COUPONS ||--o{ COUPON_REDEMPTIONS : "redeemed in"
    ORDERS ||--o{ COUPON_REDEMPTIONS : "applies"

    PAYMENTS ||--o{ PAYMENT_WEBHOOK_EVENTS : "reconciles"

    USERS {
        uuid id PK
        string full_name
        string email UK
        string password_hash
        string phone_number
        string role "Customer | Admin | SuperAdmin"
        boolean is_active
        datetime created_at_utc
        datetime updated_at_utc
    }

    ADDRESSES {
        uuid id PK
        uuid user_id FK
        string address_type "Home | Work | Other"
        string recipient_name
        string phone
        string street_line1
        string street_line2
        string landmark
        string city
        string state
        string pincode
        boolean is_default
    }

    CATEGORIES {
        uuid id PK
        uuid parent_id FK "Nullable"
        string name
        string slug UK
        string description
        string banner_image_url
        int display_order
        boolean is_active
    }

    PRODUCTS {
        uuid id PK
        uuid category_id FK
        string sku UK
        string title
        string slug UK
        string summary
        text description
        string fabric_material
        string care_instructions
        decimal base_price
        decimal sale_price "Nullable"
        boolean is_featured
        boolean is_active
        datetime created_at_utc
    }

    PRODUCT_IMAGES {
        uuid id PK
        uuid product_id FK
        string image_url
        string thumbnail_url
        string alt_text
        int display_order
        boolean is_primary
    }

    PRODUCT_VARIANTS {
        uuid id PK
        uuid product_id FK
        string variant_sku UK
        string size "XS | S | M | L | XL | XXL | FreeSize"
        string color_name
        string color_hex
        decimal price_adjustment
        boolean is_active
    }

    INVENTORY {
        uuid id PK
        uuid variant_id FK UK
        int quantity_available
        int quantity_reserved
        int low_stock_threshold
        datetime updated_at_utc
    }

    INVENTORY_TRANSACTIONS {
        uuid id PK
        uuid variant_id FK
        uuid order_id FK "Nullable"
        string transaction_type "Restock | Reservation | Deduction | Release | Adjustment"
        int quantity_delta
        int balance_after
        string reason
        uuid performed_by_user_id FK "Nullable"
        datetime created_at_utc
    }

    CARTS {
        uuid id PK
        uuid user_id FK "Nullable for guest session"
        string guest_session_token UK "Nullable"
        datetime updated_at_utc
    }

    CART_ITEMS {
        uuid id PK
        uuid cart_id FK
        uuid variant_id FK
        int quantity
        datetime added_at_utc
    }

    ORDERS {
        uuid id PK
        string order_number UK
        uuid user_id FK
        uuid shipping_address_id FK
        decimal subtotal_amount
        decimal discount_amount
        decimal shipping_fee
        decimal total_amount
        string status "Placed | Confirmed | Processing | Shipped | Delivered | Cancelled"
        string payment_status "Pending | Paid | Failed | Refunded"
        datetime placed_at_utc
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid variant_id FK
        string product_title_snapshot
        string variant_sku_snapshot
        string size_snapshot
        string color_snapshot
        string primary_image_snapshot
        decimal unit_price
        int quantity
        decimal line_total
    }

    PAYMENTS {
        uuid id PK
        uuid order_id FK
        string razorpay_order_id UK
        string razorpay_payment_id UK "Nullable"
        string razorpay_signature "Nullable"
        decimal amount
        string currency "INR"
        string status "Created | Authorized | Captured | Failed"
        string failure_reason "Nullable"
        datetime created_at_utc
    }

    PAYMENT_WEBHOOK_EVENTS {
        uuid id PK
        string event_id UK
        string event_type
        text raw_payload
        string processing_status "PROCESSED | FAILED | IGNORED"
        datetime received_at_utc
    }

    COUPONS {
        uuid id PK
        string code UK
        string discount_type "Percentage | Flat"
        decimal discount_value
        decimal min_order_amount
        decimal max_discount_amount "Nullable"
        datetime valid_from_utc
        datetime valid_until_utc
        int usage_limit_total
        int usage_limit_per_user
        boolean is_active
    }

    COUPON_REDEMPTIONS {
        uuid id PK
        uuid coupon_id FK
        uuid order_id FK
        uuid user_id FK
        decimal discount_applied
        datetime redeemed_at_utc
    }

    SHIPMENTS {
        uuid id PK
        uuid order_id FK
        string courier_partner
        string tracking_number
        string tracking_url
        string shipment_status "Manifested | PickedUp | InTransit | OutForDelivery | Delivered"
        datetime shipped_at_utc
        datetime estimated_delivery_utc
    }

    ORDER_STATUS_HISTORY {
        uuid id PK
        uuid order_id FK
        string status
        string notes
        uuid updated_by_user_id FK "Nullable"
        datetime timestamp_utc
    }

    REVIEWS {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        int rating
        string title
        text comment
        boolean is_verified_buyer
        boolean is_approved
        datetime created_at_utc
    }

    RETURNS_REFUNDS {
        uuid id PK
        uuid order_id FK
        string reason
        string status "Requested | Approved | PickedUp | Refunded | Rejected"
        decimal refund_amount
        string refund_transaction_id "Nullable"
        datetime requested_at_utc
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK "Nullable"
        string action
        string entity_name
        string entity_id
        text changes_json
        string ip_address
        datetime timestamp_utc
    }
```

---

## 3. Database Indexes for High-Traffic Read Optimization

1. `IX_Products_CategoryId_IsActive` on `Products(category_id, is_active)`
2. `IX_Products_Slug` on `Products(slug)` (Unique)
3. `IX_ProductVariants_ProductId` on `ProductVariants(product_id)`
4. `IX_Inventory_VariantId` on `Inventory(variant_id)` (Unique)
5. `IX_Orders_UserId_PlacedAt` on `Orders(user_id, placed_at_utc DESC)`
6. `IX_Payments_RazorpayOrderId` on `Payments(razorpay_order_id)`
7. `IX_PaymentWebhookEvents_EventId` on `PaymentWebhookEvents(event_id)` (Unique)
8. `IX_CartItems_CartId_VariantId` on `CartItems(cart_id, variant_id)`

---

## 4. Free Cloud Database Configuration

Per user requirements, the platform will **not depend solely on localhost databases**.
The backend connects directly to any free cloud-hosted database:
- **Neon Cloud PostgreSQL (Recommended Free Tier)**: Serverless, 0.5 GB storage, instant branching, connection pooling URL with SSL.
- **Supabase Cloud PostgreSQL**: 500MB free tier, instant REST & direct pooling connection string.
- **Azure SQL Free Database**: 100,000 vCore seconds/month free tier.

The backend EF Core DbContext is built with provider flexibility (`UseNpgsql` or `UseSqlServer` controlled by `DatabaseProvider` configuration in `appsettings.json`).
