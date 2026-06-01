# Fisher El Hotel Management & ERP System (Microservices)

Welcome to the **Fisher El Hotel Management and ERP System**, a production-grade hospitality platform engineered as a decoupled, high-performance microservices network using **Laravel 11**, containerized with **Docker**, orchestrated using **Docker Compose**, and routed through an **Nginx API Gateway**.

This project implements a state-of-the-art hotel management environment tailored to the operational requirements of **Fisher El Hotel** (Bacolod City, Philippines).

---

## 🌟 Premium Features
*   **Decoupled Microservices:** 4 independent functional microservices + 1 Authentication service, each running in distinct PHP-FPM containers with isolated MySQL databases.
*   **API Gateway Routing:** Single entry point (`http://localhost`) routed using Nginx to handle request resolution and cross-origin security (CORS).
*   **Stateless JWT Security:** Shared token-signature verification across services using standard JSON Web Tokens.
*   **Dual-Mode Interactive Dashboard:** A gorgeous glassmorphic dark UI representing all actors (Guest, Front Desk, Housekeeper, General Manager) with a localized high-fidelity simulation sandbox (persistent `localStorage`) and live connected API channels.

---

## 🏗️ Architectural Topology

```
                  +----------------------------------+
                  |         Client Dashboard         |
                  |           (index.html)           |
                  +-----------------+----------------+
                                    |
                                    | HTTP Requests (Port 8080)
                                    v
                  +-----------------+----------------+
                  |     API Gateway (Nginx Router)   |
                  +--------+--------+--------+-------+
                           |        |        |
        +------------------+        |        +------------------+
        | /api/auth                 | /api/bookings             | /api/housekeeping
        v                           v                           v
+-------+--------+          +-------+--------+          +-------+--------+
|  Auth Service  |          | Booking Service|          |  Housekeeper   |
|   (Port 8001)  |          |   (Port 8002)  |          |   (Port 8003)  |
+-------+--------+          +-------+--------+          +-------+--------+
        |                           |                           |
        v [Isolated DB]             v [Isolated DB]             v [Isolated DB]
+-------+--------+          +-------+--------+          +-------+--------+
|  fe_auth_db    |          | fe_booking_db  |          |fe_housekeep_db |
+----------------+          +----------------+          +----------------+
                                    |
                                    | Sync REST Call (Notify / Settle)
                                    v
                            +-------+--------+
                            | Finance Service|
                            |   (Port 8004)  |
                            +-------+--------+
                                    |
                                    v [Isolated DB]
                            +-------+--------+
                            |  fe_finance_db |
                            +----------------+
```

---

## 📂 Codebase Directory Organization
```
FisherEl_Hotel/
├── index.html               <-- Premium Actor Dashboard Portal
├── docker-compose.yml       <-- Multi-container orchestrator
├── start-fisherel.bat       <-- One-click Windows launch script
├── README.md                <-- Documentation Manual
├── api-gateway/
│   └── nginx.conf           <-- Gateway reverse proxy routing
└── services/
    ├── auth-service/        <-- Port 8001 (JWT, users, roles)
    ├── booking-service/     <-- Port 8002 (Rooms, reservations, check-in)
    ├── housekeeping-service/ <-- Port 8003 (Task log reports)
    └── finance-service/     <-- Port 8004 (Invoices, room charges, payments)
```

---

## 🚀 Instant Local Deployment Guide

Follow these steps to run the microservices stack on your local machine using Docker:

> Before starting, copy the example environment file:
> ```bash
> cp .env.example .env
> ```
> You can edit `.env` to configure local or production secrets.
>
### 1. Build and Launch Containers

**Option A — One-click (Windows):**
Simply double-click `start-fisherel.bat` in the project root.

**Option B — Manual:**
Ensure that Docker Desktop is running, then execute the following command at the root directory of the project:
```bash
docker compose up -d --build
```
This boots 9 concurrent containers: 4 isolated Laravel applications, 4 MySQL databases, and the Nginx Gateway.

For local development, an optional override file is included automatically by Docker Compose:
```bash
docker compose up -d --build
```
The `docker-compose.override.yml` file exposes database ports and enables `APP_DEBUG=true` for local testing.

### 2. Run Database Migrations and Seeding
Initialize the databases and seed testing accounts inside each active container:
```bash
# 1. Auth Service
docker-compose exec auth-service php artisan migrate --seed

# 2. Booking Service
docker-compose exec booking-service php artisan migrate --seed

# 3. Housekeeping Service
docker-compose exec housekeeping-service php artisan migrate --seed

# 4. Finance Service
docker-compose exec finance-service php artisan migrate --seed
```

> **Note:** `docker-compose exec` requires the **service name** (e.g., `auth-service`), not the container name (e.g., `fe-auth-service`). Wait a few seconds after `docker-compose up` before running migrations to allow the MySQL containers to finish initializing.

### 3. Open the Dashboard
Simply double-click the `index.html` file in your project directory or serve it locally.

---

## 🧪 Simulation Test Credentials (Multi-Role Flow)

To perform end-to-end testing, log into the dashboard or toggle user roles using these preconfigured accounts:

| Role | Email | Password | Operations |
| :--- | :--- | :--- | :--- |
| **Guest** | `guest@fisherel.com` | `password` | Search & reserve suites, view invoices. |
| **Receptionist** | `receptionist@fisherel.com` | `password` | Check-in bookings, view rooms, release checkout. |
| **Housekeeper** | `housekeeper@fisherel.com` | `password` | Log room cleaning tasks, inspect logs. |
| **Manager** | `manager@fisherel.com` | `password` | Settle invoices, post restaurant room charges, view analytics. |

---

## 🐳 Docker Container Reference

| Service Name | Container Name | Role | Host Port |
| :--- | :--- | :--- | :--- |
| `api-gateway` | `fe-api-gateway` | API Gateway (Nginx) | **80** |
| `auth-service` | `fe-auth-service` | Authentication (Laravel) | — |
| `booking-service` | `fe-booking-service` | Sales & Booking (Laravel) | — |
| `housekeeping-service` | `fe-housekeeping-service` | Housekeeping (Laravel) | — |
| `finance-service` | `fe-finance-service` | Finance & Billing (Laravel) | — |
| `auth-db` | `fe-auth-db` | Auth MySQL Database | 33061 |
| `booking-db` | `fe-booking-db` | Booking MySQL Database | 33062 |
| `housekeeping-db` | `fe-housekeeping-db` | Housekeeping MySQL Database | 33063 |
| `finance-db` | `fe-finance-db` | Finance MySQL Database | 33064 |

All containers communicate over the `fisherel-network` internal Docker bridge network.

---

## 📡 API Gateway Endpoint Route Specifications

All endpoints are authenticated using the Bearer JWT token in the `Authorization` header.

### 🔑 Authentication Service (`/api/auth/*` -> Port 8001)
*   `POST /api/auth/register` - Create new user account.
*   `POST /api/auth/login` - Authenticate credentials, issues stateless JWT.
*   `GET /api/auth/user` - Retrieve token user identity context.

### 🛌 Sales & Booking Service (`/api/bookings/*` -> Port 8002)
*   `GET /api/bookings/rooms` - Fetch list of rooms and active statuses.
*   `PUT /api/bookings/rooms/{id}/status` - Modify room status directly.
*   `POST /api/bookings/bookings` - Submit stay reservations.
*   `POST /api/bookings/bookings/{id}/checkin` - Check-in guest (triggers Finance Service to create invoice, marks room Occupied).
*   `POST /api/bookings/bookings/{id}/checkout` - Settle stay (verifies paid invoice with Finance, releases room to Dirty).

### 🧹 Housekeeping & Maintenance (`/api/housekeeping/*` -> Port 8003)
*   `GET /api/housekeeping/logs` - Fetch housekeeping checklist logs.
*   `POST /api/housekeeping/logs` - Record task cleaning (automatically synchronizes status to Booking Service).

### 💳 Finance, Accounting & Invoicing (`/api/finance/*` -> Port 8004)
*   `GET /api/finance/invoices` - Fetch billing register.
*   `POST /api/finance/invoices` - Initialize new invoice.
*   `POST /api/finance/invoices/{id}/charges` - Post restaurant or spa room charge items.
*   `POST /api/finance/invoices/{id}/pay` - Settle payments (Credit Card, Check, Cash).
*   `GET /api/finance/analytics` - Managers daily occupancy revenue metrics.

---

## 🛑 Stopping the System

To gracefully shut down all Fisher El containers:
```bash
docker-compose down
```

To also remove all database volumes (full reset):
```bash
docker-compose down -v
```

---

## 🔧 Troubleshooting

### Container name conflict on startup
If you see `Conflict. The container name "/fe-<service>" is already in use`, a stale container is still registered. Force-remove it and restart:
```bash
docker rm -f <container-name>
docker-compose up -d
```
Or clean up all stopped containers at once:
```bash
docker container prune -f
docker-compose up -d
```

### `docker-compose down` hangs on `fe-api-gateway`
Nginx does not respond to the default `SIGTERM` signal sent by Docker. To prevent the 229-second timeout, add these lines to the `api-gateway` service in `docker-compose.yml`:
```yaml
  api-gateway:
    ...
    stop_signal: SIGQUIT
    stop_grace_period: 5s
```
Alternatively, force-remove the stuck container:
```bash
docker rm -f fe-api-gateway
```

### Migration fails with `getaddrinfo for <service>-db failed`
This means the database container has not finished initializing yet. Wait 10–15 seconds after `docker-compose up -d --build` completes before running migrations. You can verify all containers are healthy with:
```bash
docker-compose ps
```
All services should show `Up` before executing `migrate --seed`.
