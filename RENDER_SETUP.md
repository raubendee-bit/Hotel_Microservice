# Render setup checklist for Hotel_Microservice

This file lists the exact Render dashboard fields, environment variable names, and a short UI checklist to create the services declared in `render.yaml`.

Overview
- Repo: connect your GitHub repo to Render and use the `render.yaml` manifest at the repo root.
- Plan: free (note limits: no shell, limited resources, public URLs).

Services to create (exact names used in `render.yaml`)
- `api-gateway` (Web Service)
- `auth-service` (Web Service)
- `booking-service` (Web Service)
- `finance-service` (Web Service)
- `housekeeping-service` (Web Service)
- `hotel-frontend` (Static Site)

Per-service Render dashboard values (UI fields)
- Service Type: "Web Service" (or Static Site for `hotel-frontend`)
- Name: use exact names above
- Environment: "Docker"
- Root Directory: set to the matching path (e.g. `services/auth-service`)
- Dockerfile Path: `services/<service>/Dockerfile` (or `api-gateway/Dockerfile`)
- Branch: `main` (or your branch)
- Plan: `free`
- Health Check Path: use `/api/health` for Laravel services; for gateway use `/health`

Environment variables to set per-service (set these under Service → Environment; mark secrets as Private/Secret)

Shared DB vars (set as secrets):
- `DB_CONNECTION` = mysql
- `DB_HOST` = <your-db-host> (set as secret)
- `DB_PORT` = 3306
- `DB_DATABASE` = <your-db-name> (secret)
- `DB_USERNAME` = <your-db-user> (secret)
- `DB_PASSWORD` = <your-db-pass> (secret)

Per-service example vars (set these in the dashboard for each service):
- `APP_KEY` = (generate locally with `php artisan key:generate --show`) — set as secret
- `APP_ENV` = production
- `APP_DEBUG` = false
- `APP_URL` = https://<service-name>.onrender.com (Render will show the exact URL after deploy)

API gateway-specific env vars (set in `api-gateway` service):
- `AUTH_SERVICE_URL` = https://auth-service.onrender.com
- `BOOKING_SERVICE_URL` = https://booking-service.onrender.com
- `FINANCE_SERVICE_URL` = https://finance-service.onrender.com
- `HOUSEKEEPING_SERVICE_URL` = https://housekeeping-service.onrender.com

Notes: replace `.onrender.com` hostnames with the actual URLs Render assigns to each service after first deployment. Keep those gateway values private if you prefer (they are public endpoints but you can use API keys).

GitHub Secrets required (Settings → Secrets) for manual migrations workflow
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `APP_KEY` (same as per-service APP_KEY)

Checklist: step-by-step UI actions
1. Push this repo to GitHub (ensure `render.yaml` and `.github/workflows/run-migrations.yml` are present).
2. In Render dashboard, click "New → Web Service" and choose "Deploy using render.yaml" or connect the repo and let Render read the manifest.
3. Confirm services created: `api-gateway`, `auth-service`, `booking-service`, `finance-service`, `housekeeping-service`, and the static site `hotel-frontend`.
4. For each Laravel service, open Service → Environment and set secrets: `APP_KEY`, `DB_*` values. Mark sensitive keys as Private.
5. For `api-gateway` service, set `*_SERVICE_URL` env vars to the public URLs Render shows for each service (you may need to deploy services once to see their URLs).
6. Deploy services. Monitor Deploy logs for build errors. Fix Composer/PHP errors locally and push again.
7. After services build, set health checks (Service → Settings) to the `healthCheckPath` values in `render.yaml`.
8. Add GitHub Secrets (see list above) in the repo Settings → Secrets.
9. Trigger the "Run Laravel migrations (manual)" workflow in the Actions tab to run migrations against your external DB.
10. Confirm application endpoints by visiting `hotel-frontend` static site or the `api-gateway` URL.

Troubleshooting notes
- If you see DB connection errors, check that your external DB allows connections from Render's IP ranges or supports connection via the cloud provider (use managed Postgres provider like Supabase/Neon that permits public connections).
- If migrations fail in CI, run them locally against the remote DB first to verify.
- Use `LOG_CHANNEL=stderr` in Render env to surface Laravel logs in the Render dashboard logs.

If you want, I can also generate a small checklist UI file in the repo root or automate filling the actual service URLs into `render.yaml` after you provide them.
