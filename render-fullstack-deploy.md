# 🌐 Full-Stack Cloud Deployment on Render using Blueprints

This guide details how to deploy the entire containerized **Fisher El Hotel ERP Suite** (Frontend, 4 Microservices, API Gateway, and MySQL Database) to the cloud on **Render.com**.

We utilize **Render Blueprints**, which allows you to define your entire multi-service stack in a single `render.yaml` file and spin it up with a single click!

---

## 🏗️ Architecture on Render

When deployed to Render, the architecture mirrors your local Docker Compose setup:

```
[ Public User (Browser) ]
           │
           ▼
    [ Vercel / Render Static Site ]  (Frontend Portal)
           │
           ▼ (HTTPS API Calls)
    [ Render API Gateway Web Service ] (Nginx Router)
           │
           ├──► [ Auth Service Web Service ] ──────┐
           ├──► [ Booking Service Web Service ] ───┼──► [ Unified MySQL Service ]
           ├──► [ Housekeeping Service Web Service ] │
           └──► [ Finance Service Web Service ] ───┘
```

---

## 🛠️ Step 1: Prepare the Codebase for Render

I have already created the necessary files in your project directory:
1. **[render.yaml](file:///d:/Rovin/Projects/2025-2026/ITSAR2/FisherEl_Hotel/render.yaml)**: Defines all 7 services (Frontend, Nginx Gateway, Auth, Booking, Housekeeping, Finance, and a unified Database).
2. **[api-gateway/Dockerfile](file:///d:/Rovin/Projects/2025-2026/ITSAR2/FisherEl_Hotel/api-gateway/Dockerfile)**: Added to build the Nginx gateway as a deployable Docker container in Render.

### Update Frontend API Path
Before pushing, ensure your frontend HTML files are pointing to your new Render Nginx API Gateway URL. 

Once your Blueprint is deployed, Render will assign your Gateway a URL like: `https://fe-api-gateway.onrender.com`.

Update your HTML files using PowerShell:
```powershell
Get-ChildItem -Filter *.html -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace 'http://localhost:8080', 'https://fe-api-gateway.onrender.com' | Set-Content $_.FullName
}
```

---

## 🚀 Step 2: Deploy the Blueprint on Render

1. Log in to your [Render Dashboard](https://render.com/).
2. Click the **New +** button in the top right and select **Blueprint**.
3. Connect your GitHub repository containing the project.
4. Render will automatically read the `render.yaml` file in the root of your project.
5. Review the list of services to be created:
   * `fe-mysql-db` (Private Database Service)
   * `fe-auth-service`, `fe-booking-service`, `fe-housekeeping-service`, `fe-finance-service` (Docker Microservices)
   * `fe-api-gateway` (Nginx Gateway Router)
   * `fe-frontend` (Static Website)
6. Click **Apply**! Render will start building and spinning up all 7 services in parallel.

---

## 🗄️ Step 3: Run Database Migrations in the Cloud

Once your services and database are live, you need to run the migrations to create the database tables:

1. Go to your Render Dashboard.
2. Click on **fe-auth-service**.
3. On the left sidebar, click **Shell**.
4. Run the Laravel migration command:
   ```bash
   php artisan migrate --force
   ```
5. Repeat this for the other services (**fe-booking-service**, **fe-housekeeping-service**, and **fe-finance-service**) by opening their respective shells and running the same command.

---

## ⚠️ Free Tier Resource Considerations

> [!WARNING]
> * **Data Persistency:** Render's free tier does not support persistent disks. This means if your MySQL database service restarts, your data will reset. For actual production use, it is highly recommended to upgrade the database service to Render's **Starter SSD** disk tier ($7/month) or connect to an external hosted database (e.g. Aiven, PlanetScale, or AWS RDS).
> * **Service Spin Down:** On Render's free tier, Web Services spin down (go to sleep) after 15 minutes of inactivity. When a new user requests the page, it can take 30–50 seconds for the backend to wake up.
