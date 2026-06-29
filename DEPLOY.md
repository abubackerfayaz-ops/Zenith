# Zenith Deployment Guide

## Architecture
- Frontend: Vite + React (static, served via Nginx)
- Backend: NestJS + Node.js (API server)
- Database: PostgreSQL (Supabase free tier)
- Cache: Redis (Upstash free tier)
- Storage: Cloudinary free tier
- Realtime: Socket.IO (attached to NestJS on port 4345)

## Option 1: Docker (self-hosted)

```bash
# Set your PostgreSQL password
export POSTGRES_PASSWORD=your-secure-password

# Build and start all services
docker compose up -d --build

# Run database migrations + seed
docker compose exec api npx prisma db push
docker compose exec api npx ts-node --transpile-only prisma/seed.ts
```

Services:
- Web: http://localhost:4344
- API: http://localhost:4345
- API Docs: http://localhost:4345/api/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Option 2: Render (backend) + Vercel (frontend)

### Backend (Render)
1. Create a Web Service on Render
2. Root directory: `apps/api`
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `node dist/main`
5. Set environment variables in Render dashboard:
   - `DATABASE_URL` = your Supabase PostgreSQL URL
   - `REDIS_URL` = your Upstash Redis URL
   - `JWT_SECRET` = random secure string
   - `JWT_REFRESH_SECRET` = random secure string
   - `CLOUDINARY_CLOUD_NAME` = `dtqhdqoob`
   - `CLOUDINARY_API_KEY` = `668842416636121`
   - `CLOUDINARY_API_SECRET` = your Cloudinary secret
   - `FRONTEND_URL` = your Vercel app URL
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` = your email provider

### Frontend (Vercel)
1. Create a new Vercel project
2. Root directory: `apps/web`
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable:
   - `VITE_API_URL` = your Render API URL (e.g., https://zenith-api.onrender.com)

## Env File Reference

See `apps/api/.env` for all required variables.

## Supabase Database Setup
1. Create a free Supabase project at https://supabase.com
2. Go to Project Settings → Database → Connection string
3. Copy the URI and set as `DATABASE_URL`
4. Run: `cd apps/api && npx prisma db push`
5. Run: `cd apps/api && npx ts-node --transpile-only prisma/seed.ts`

## Upstash Redis Setup
1. Create a free Redis database at https://upstash.com
2. Copy the `UPSTASH_REDIS_REST_URL`
3. Set as `REDIS_URL` in backend env

## Cloudinary Setup
Already configured with your account:
- Cloud name: `dtqhdqoob`
- API Key: `668842416636121`
- API Secret: as provided

## Preventing Free Tier Sleep (UptimeRobot)

Both Render (15-min idle sleep) and Supabase (free tier auto-pause) will stop your services with no traffic. **UptimeRobot** is a free monitoring service that pings your URL every 5-30 minutes to prevent this.

1. Create a free account at https://uptimerobot.com
2. Add a **monitor** for your Render API:
   - URL: `https://your-app.onrender.com/health`
   - Interval: **5 minutes** (keeps both Render + Supabase alive)
3. The `/health` endpoint checks DB connectivity, so one ping keeps both alive.

## Production Readiness Checklist
- [ ] PostgreSQL connected (Supabase)
- [ ] Redis connected (Upstash)
- [ ] SMTP configured for forgot password emails
- [ ] JWT secrets updated to secure random values
- [ ] Rate limiting enabled (already configured in app.module.ts)
- [ ] Helmet security headers enabled (already in main.ts)
- [ ] CORS configured for production domain
- [ ] Prisma migrations run and seeded
- [ ] Database backups enabled (Supabase handles this)
- [ ] Monitoring/logging set up
