# Tracepack — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Type:** Standalone project (portfolio piece, past status)

---

## Overview

Tracepack is a multi-household food expiry tracker. Households log groceries with expiry dates, monitor urgency on a dashboard, and receive a daily email digest of items expiring within 2 days. A weekly waste summary shows how many items expired unused.

The project runs entirely on localhost via `docker compose up`. No live deployment. Auth is mock JWT (no OAuth). Email is SMTP-configurable — ships with Mailhog for local testing, swap credentials for real delivery.

---

## Architecture

```
tracepack/
├── frontend/          # Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
├── backend/           # FastAPI, SQLAlchemy, Alembic, APScheduler
├── docker-compose.yml # 4 services: frontend, backend, db, mailhog
└── .env.example       # all configurable vars documented
```

### Docker Services

| Service    | Image           | Port | Purpose                              |
|------------|-----------------|------|--------------------------------------|
| `db`       | postgres:15     | 5432 | PostgreSQL database                  |
| `backend`  | python:3.12     | 8000 | FastAPI app + APScheduler digest job |
| `frontend` | node:20         | 3000 | Next.js app                          |
| `mailhog`  | mailhog/mailhog | 8025 | Local SMTP catcher (web UI + SMTP)   |

Backend runs `alembic upgrade head` on startup before serving. APScheduler fires the digest job daily at `DIGEST_CRON_HOUR` (default: 8).

### Environment Variables

```
# Database
DATABASE_URL=postgresql://tracepack:tracepack@db:5432/tracepack

# Auth
JWT_SECRET=changeme
JWT_EXPIRE_MINUTES=10080

# Email (defaults to Mailhog for local dev)
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@tracepack.local

# Digest scheduler
DIGEST_CRON_HOUR=8
```

---

## Data Model

### `users`
| Column        | Type      | Notes                    |
|---------------|-----------|--------------------------|
| id            | UUID PK   |                          |
| email         | VARCHAR   | unique                   |
| name          | VARCHAR   |                          |
| password_hash | VARCHAR   | bcrypt                   |
| created_at    | TIMESTAMP |                          |

### `households`
| Column      | Type      | Notes                               |
|-------------|-----------|-------------------------------------|
| id          | UUID PK   |                                     |
| name        | VARCHAR   |                                     |
| invite_code | VARCHAR   | short slug e.g. `GRAPE-7F2`, unique |
| created_at  | TIMESTAMP |                                     |

### `household_members`
| Column       | Type      | Notes              |
|--------------|-----------|--------------------|
| user_id      | UUID FK   |                    |
| household_id | UUID FK   |                    |
| role         | ENUM      | `owner` \| `member` |
| joined_at    | TIMESTAMP |                    |

### `items`
| Column       | Type      | Notes                           |
|--------------|-----------|---------------------------------|
| id           | UUID PK   |                                 |
| household_id | UUID FK   |                                 |
| added_by     | UUID FK   | references users.id             |
| name         | VARCHAR   |                                 |
| category     | ENUM      | see categories below            |
| quantity     | INT       |                                 |
| unit         | VARCHAR   | e.g. `pcs`, `ml`, `g`           |
| expiry_date  | DATE      |                                 |
| consumed     | BOOLEAN   | default false                   |
| created_at   | TIMESTAMP |                                 |

**Categories (fixed):** Dairy, Meat, Produce, Bakery, Beverages, Frozen, Other

### `digest_logs`
| Column        | Type      | Notes                       |
|---------------|-----------|-----------------------------|
| id            | UUID PK   |                             |
| household_id  | UUID FK   |                             |
| sent_at       | TIMESTAMP |                             |
| items_alerted | INT       | number of items in the send |

---

## API Endpoints

### Auth
| Method | Path             | Description              |
|--------|------------------|--------------------------|
| POST   | /auth/register   | Create user, return JWT  |
| POST   | /auth/login      | Verify password, return JWT |

### Households
| Method | Path                         | Description                      |
|--------|------------------------------|----------------------------------|
| POST   | /households                  | Create household (caller = owner)|
| POST   | /households/join             | Join by invite_code              |
| GET    | /households/me               | Get current user's household     |

### Items
| Method | Path                  | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | /items                | List all items for household         |
| POST   | /items                | Add item                             |
| PATCH  | /items/{id}/consumed  | Toggle consumed flag                 |
| DELETE | /items/{id}           | Delete item                          |

### Stats
| Method | Path    | Description                                      |
|--------|---------|--------------------------------------------------|
| GET    | /stats  | Monthly added/consumed/wasted counts for household |

All endpoints except `/auth/*` require `Authorization: Bearer <token>` header.

---

## Pages & Features

### Auth
- `/login` — email + password form, stores JWT in `localStorage`
- `/register` — name, email, password
- No email verification, no OAuth

### Onboarding
- First login redirect → `/onboarding`
- Two options: **Create household** (name → get invite code) or **Join household** (enter invite code)
- Users belong to exactly one household

### Dashboard `/`
- Items grouped in 3 urgency lanes:
  - 🔴 **Expires soon** — today or tomorrow
  - 🟡 **This week** — 2–7 days
  - 🟢 **Fine** — 8+ days
- Quick-add button → name, category, expiry date, quantity, unit
- Click item → mark consumed or delete
- Header shows household name + invite code for sharing

### Stats `/stats`
- Monthly bar chart: items added vs consumed vs wasted (expired + not consumed)
- Built with Recharts
- Defaults to current month, month picker to navigate back

---

## Email Digest

### Daily Digest (08:00 AM)
- Triggered by APScheduler inside the FastAPI process
- For each household: query items with `expiry_date <= today + 2 days` and `consumed = false`
- If no urgent items → skip (no email sent)
- Otherwise: send to all household members
- Log to `digest_logs`

**Email content:**
```
Subject: 🥛 Tracepack — 3 items expiring soon

Hi [name],

These items in [household] expire within 2 days:

• Milk (Dairy) — expires tomorrow
• Spinach (Produce) — expires today
• Yogurt (Dairy) — expires in 2 days

Log in to mark them as consumed: http://localhost:3000
```

### Weekly Waste Summary (Monday 08:00 AM)
- Sent every Monday
- Shows previous week: items added, consumed, wasted
- Only sent if at least 1 item was wasted that week

---

## Commit Strategy

Commits are spread across ~6 weeks to reflect realistic development pace.

### Phase 1 — Scaffold (~5 commits, week 1)
- `chore: init next.js frontend`
- `chore: init fastapi backend`
- `chore: add docker-compose with postgres and mailhog`
- `chore: add alembic and initial migrations`
- `docs: add README with setup instructions`

### Phase 2 — Auth & Households (~6 commits, week 2)
- `feat: user registration and JWT auth`
- `feat: login endpoint`
- `feat: household create with invite code`
- `feat: join household by invite code`
- `feat: auth middleware for protected routes`
- `fix: password validation edge cases`

### Phase 3 — Items CRUD (~7 commits, week 3)
- `feat: add item endpoint`
- `feat: list items by household`
- `feat: mark item as consumed`
- `feat: delete item`
- `feat: item categories enum`
- `fix: expiry date timezone handling`
- `refactor: item schema validation`

### Phase 4 — Frontend (~8 commits, weeks 4–5)
- `feat: login and register pages`
- `feat: household onboarding flow`
- `feat: dashboard with expiry urgency lanes`
- `feat: quick-add item form`
- `feat: consumed and delete item actions`
- `feat: stats page with waste chart`
- `fix: mobile layout on dashboard`
- `chore: add loading and empty states`

### Phase 5 — Digest & Polish (~5 commits, week 6)
- `feat: daily digest scheduler with apscheduler`
- `feat: html email template for digest`
- `feat: weekly waste summary email`
- `fix: skip digest when no urgent items`
- `docs: update README with email configuration`

---

## Tech Stack Summary

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind, shadcn/ui, Recharts |
| Backend    | FastAPI, SQLAlchemy 2, Alembic, APScheduler, bcrypt, python-jose |
| Database   | PostgreSQL 15                           |
| Email      | aiosmtplib + Jinja2 templates           |
| Dev email  | Mailhog                                 |
| Containers | Docker Compose                          |
| CI         | GitHub Actions (lint + build check)     |

---

## Out of Scope

- Live deployment
- Real OAuth / Auth0
- Push notifications
- Mobile app
- Multi-household membership per user
- Item barcode scanning
