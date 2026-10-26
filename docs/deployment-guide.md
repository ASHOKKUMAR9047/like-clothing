# Free Cloud Deployment & Hosting Guide: Miraya Couture

This guide explains how to deploy the **Miraya Couture** platform completely free of cost without running on localhost, as requested (*"database yellamee localhost la vaika venam ethavathu free server la vachukoo ... and website hosting um free ya panni kutu"*).

---

## 1. Free Cloud Database: Neon Serverless PostgreSQL (500MB Free)

1. Go to [https://neon.tech](https://neon.tech) and sign up using GitHub or Google.
2. Click **Create Project**:
   - Name: `miraya-couture-db`
   - Region: `ap-southeast-1` (Singapore) or nearest region.
3. Once created, copy the **Connection string**:
   ```text
   Host=ep-xxxx-xxxx.ap-southeast-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=your_password;SSL Mode=Require;Trust Server Certificate=true
   ```
4. Configure in `backend/FashionStore.Api/appsettings.json` (or Render environment variable):
   - `DatabaseProvider`: `PostgreSQL`
   - `ConnectionStrings:DefaultConnection`: `<Your Neon Connection String>`
5. At startup, `DbInitializer.SeedAsync` automatically creates the schema and seeds all luxury products, variants, and admin accounts without manual SQL scripts!

---

## 2. Free Backend Web Service: Render.com

1. Push your repository to GitHub.
2. Sign up at [https://render.com](https://render.com) and click **New + > Web Service**.
3. Select your GitHub repository.
4. Configure settings:
   - **Name**: `miraya-couture-api`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: `Free`
5. Add Environment Variables in the Render dashboard:
   | Key | Value |
   | :--- | :--- |
   | `ASPNETCORE_ENVIRONMENT` | `Production` |
   | `DatabaseProvider` | `PostgreSQL` |
   | `ConnectionStrings__DefaultConnection` | `<Your Neon Connection String>` |
   | `Razorpay__KeyId` | `rzp_test_YourKey` |
   | `Razorpay__KeySecret` | `YourSecret` |
   | `Jwt__SecretKey` | `MirayaCoutureSecretKey2026BespokeLuxuryAtelier998877` |
6. Click **Deploy Web Service**. Once deployed, your backend will be live at `https://miraya-couture-api.onrender.com`.

---

## 3. Free Frontend Hosting: Vercel

1. Go to [https://vercel.com](https://vercel.com) and click **Add New > Project**.
2. Select your repository.
3. Framework Preset: `Vite`.
4. Root Directory: `frontend`.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Environment Variables:
   - `VITE_API_BASE_URL`: `https://miraya-couture-api.onrender.com/api/v1`
8. Click **Deploy**. Your store will be live at `https://miraya-couture.vercel.app` with global CDN caching and HTTPS.

---

## 4. Razorpay Test Mode Setup

1. Sign up at [https://dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Toggle the switch to **Test Mode**.
3. Navigate to **Account & Settings > API Keys > Generate Test Key**.
4. Copy:
   - `Key Id`: `rzp_test_xxxxxx`
   - `Key Secret`: `xxxxxx`
5. Add to backend environment configuration and frontend `.env`.

---

## 5. Local Quick Start

To run both frontend and backend locally with zero setup:

### Terminal 1: Backend API
```bash
cd backend
dotnet run --project FashionStore.Api/FashionStore.Api.csproj --urls "http://127.0.0.1:5050"
```
- Swagger UI: [http://127.0.0.1:5050/swagger](http://127.0.0.1:5050/swagger)
- Health Check: [http://127.0.0.1:5050/health](http://127.0.0.1:5050/health)

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
- Storefront URL: [http://127.0.0.1:5174/](http://127.0.0.1:5174/)
- Admin Demo Credentials: Click "Switch to Admin Mode" in Account page or log in with `admin@mirayacouture.com`.
