# API Contract & Integration Guide: Miraya Couture

## 1. Global Conventions

- **Base URL**: `/api/v1`
- **Payload Format**: `application/json` (UTF-8)
- **Authentication**: Bearer JWT token sent in `Authorization: Bearer <token>` header or secure HttpOnly cookie.
- **Timestamp Standard**: ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Standard Envelope Response**:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-10-26T04:15:00Z"
}
```
- **Standard Error Response**:
```json
{
  "success": false,
  "message": "Validation failed on one or more fields.",
  "data": null,
  "errors": [
    { "field": "Pincode", "message": "Indian pincode must be exactly 6 numeric digits." }
  ],
  "timestamp": "2026-10-26T04:15:00Z"
}
```

---

## 2. API Endpoints Map

### 2.1 Authentication & Profile (`/api/v1/auth`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register customer account |
| `POST` | `/api/v1/auth/login` | Public | Login with email & password, returns JWT token & user object |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve currently logged-in user profile & role |
| `PUT` | `/api/v1/auth/profile` | Authenticated | Update full name, phone number, notification preferences |
| `POST` | `/api/v1/auth/change-password` | Authenticated | Change user password |

### 2.2 Catalog & Discovery (`/api/v1/catalog`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/catalog/categories` | Public | Retrieve active category tree (Festive Lehengas, Handloom Sarees, Anarkalis, etc.) |
| `GET` | `/api/v1/catalog/products` | Public | Filtered search (`search`, `categoryId`, `minPrice`, `maxPrice`, `size`, `color`, `sort`, `page`, `pageSize`) |
| `GET` | `/api/v1/catalog/products/featured` | Public | Curated hero collections, trending pieces, and new arrivals |
| `GET` | `/api/v1/catalog/products/{slug}` | Public | Detailed product view with all variants, images, live inventory, reviews |
| `GET` | `/api/v1/catalog/products/{id}/reviews` | Public | Approved buyer reviews & ratings summary |

### 2.3 Shopping Bag & Wishlist (`/api/v1/bag`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/bag` | Public/Guest/Auth | Get cart items with real-time validated prices, tax, delivery fee |
| `POST` | `/api/v1/bag/items` | Public/Guest/Auth | Add item variant to cart `{ variantId, quantity }` |
| `PUT` | `/api/v1/bag/items/{itemId}` | Public/Guest/Auth | Update quantity or size variant |
| `DELETE` | `/api/v1/bag/items/{itemId}` | Public/Guest/Auth | Remove line item |
| `GET` | `/api/v1/bag/wishlist` | Authenticated | Retrieve customer's saved wishlist |
| `POST` | `/api/v1/bag/wishlist/{variantId}` | Authenticated | Toggle wishlist item |

### 2.4 Checkout & Orders (`/api/v1/orders`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders/initiate-checkout` | Authenticated | Validate stock, compute final amounts, reserve items, create Razorpay Order |
| `POST` | `/api/v1/orders/verify-payment` | Authenticated | Verify HMAC-SHA256 signature (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`), confirm order |
| `GET` | `/api/v1/orders` | Authenticated | Retrieve customer order history with status |
| `GET` | `/api/v1/orders/{orderNumber}` | Authenticated | Get detailed order summary, tracking milestones, invoice breakdown |
| `POST` | `/api/v1/orders/{orderNumber}/cancel` | Authenticated | Request cancellation if order is not yet shipped |

### 2.5 Payments & Webhooks (`/api/v1/payments`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/payments/razorpay-webhook` | Public (Secret header) | Asynchronous webhook handler (`payment.captured`, `payment.failed`) with idempotency |

### 2.6 Customer Addresses (`/api/v1/addresses`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/addresses` | Authenticated | List all saved delivery addresses |
| `POST` | `/api/v1/addresses` | Authenticated | Add new address with pin code validation |
| `PUT` | `/api/v1/addresses/{id}` | Authenticated | Update address or set as default |
| `DELETE` | `/api/v1/addresses/{id}` | Authenticated | Remove address |

### 2.7 Backoffice & Admin Portal (`/api/v1/admin`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard` | Admin Only | Metrics: revenue, active orders, low-stock alerts, monthly trends |
| `GET` | `/api/v1/admin/products` | Admin Only | Full catalog listing with stock levels and status filters |
| `POST` | `/api/v1/admin/products` | Admin Only | Create new product with variants, attributes & image gallery |
| `PUT` | `/api/v1/admin/products/{id}` | Admin Only | Edit product specs, prices, active status |
| `POST` | `/api/v1/admin/inventory/adjust` | Admin Only | Manual stock adjustment with audit reason |
| `GET` | `/api/v1/admin/orders` | Admin Only | Manage all orders, update statuses (Processing, Shipped, Delivered) |
| `POST` | `/api/v1/admin/orders/{id}/ship` | Admin Only | Assign courier partner & tracking number |
| `GET` | `/api/v1/admin/coupons` | Admin Only | List, create, and toggle promotional coupons |
