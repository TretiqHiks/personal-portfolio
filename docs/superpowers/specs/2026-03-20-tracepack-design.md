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
| `backend`  | python:3.12     | 8000 | FastAPI app + APScheduler digest jobs|
| `frontend` | node:20         | 3000 | Next.js app                          |
| `mailhog`  | mailhog/mailhog | 8025 | Local SMTP catcher (web UI + SMTP)   |

Backend runs `alembic upgrade head` on startup before serving.

**APScheduler jobs (both run inside the backend process):**
- **Daily digest** — fires every day at `DIGEST_CRON_HOUR` (default: 8). Sends items expiring within 2 days to all household members.
- **Weekly summary** — fires every Monday at `DIGEST_CRON_HOUR`. Sends previous week's waste summary. Configurable via `DIGEST_WEEKLY_DAY` (0=Monday … 6=Sunday, default: 0).

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
DIGEST_WEEKLY_DAY=0
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
| Column      | Type      | Notes                                                                 |
|-------------|-----------|-----------------------------------------------------------------------|
| id          | UUID PK   |                                                                       |
| name        | VARCHAR   |                                                                       |
| invite_code | VARCHAR   | unique slug, format `{WORD}-{3 hex chars}` e.g. `GRAPE-7F2`. WORD is drawn from a fixed 20-item food wordlist; regenerate on collision. |
| created_at  | TIMESTAMP |                                                                       |

### `household_members`
| Column       | Type      | Notes               |
|--------------|-----------|---------------------|
| user_id      | UUID FK   |                     |
| household_id | UUID FK   |                     |
| role         | ENUM      | `owner` \| `member` |
| joined_at    | TIMESTAMP |                     |

### `items`
| Column       | Type      | Notes                                          |
|--------------|-----------|------------------------------------------------|
| id           | UUID PK   |                                                |
| household_id | UUID FK   |                                                |
| added_by     | UUID FK   | references users.id                            |
| name         | VARCHAR   |                                                |
| category     | ENUM      | see categories below                           |
| quantity     | INT       |                                                |
| unit         | ENUM      | `pcs` \| `g` \| `ml` \| `kg` \| `l` \| `other` |
| expiry_date  | DATE      |                                                |
| consumed     | BOOLEAN   | default false                                  |
| deleted_at   | TIMESTAMP | NULL = active; soft delete only                |
| created_at   | TIMESTAMP |                                                |

**Categories (fixed):** Dairy, Meat, Produce, Bakery, Beverages, Frozen, Other

**Soft delete:** `DELETE /items/{id}` sets `deleted_at = now()`. All queries filter `deleted_at IS NULL` by default. This preserves items for waste stats calculation.

**Wasted definition:** An item is considered wasted when `expiry_date < today AND consumed = false AND deleted_at IS NULL`.

### `digest_logs`
| Column        | Type      | Notes                                    |
|---------------|-----------|------------------------------------------|
| id            | UUID PK   |                                          |
| household_id  | UUID FK   |                                          |
| digest_type   | ENUM      | `daily` \| `weekly`                      |
| sent_at       | TIMESTAMP |                                          |
| items_alerted | INT       | number of items included in the send     |

---

## API Endpoints

### Auth
| Method | Path           | Success | Error                          |
|--------|----------------|---------|--------------------------------|
| POST   | /auth/register | 201 + JWT | 409 if email already registered |
| POST   | /auth/login    | 200 + JWT | 401 if credentials invalid     |

### Households
| Method | Path             | Description                                                                 |
|--------|------------------|-----------------------------------------------------------------------------|
| POST   | /households      | Create household (caller = owner). Returns 409 if user already has a household. |
| POST   | /households/join | Join by `invite_code`. Returns 409 if user already has a household, 404 if code not found. |
| GET    | /households/me   | Get current user's household. Returns 404 if user has no household.        |

**Single-household rule:** A user may belong to exactly one household at a time. Both `POST /households` and `POST /households/join` return `409 Conflict` if the authenticated user already has a `household_members` record.

### Items
| Method | Path                 | Description                                                       |
|--------|----------------------|-------------------------------------------------------------------|
| GET    | /items               | List items. Query params: `?consumed=false\|true\|all` (default `all`), `?active_only=true` (default `true`, excludes soft-deleted). |
| POST   | /items               | Add item. Returns 201.                                            |
| PATCH  | /items/{id}          | Update item fields (name, category, quantity, unit, expiry_date). |
| PATCH  | /items/{id}/consumed | Toggle consumed flag.                                             |
| DELETE | /items/{id}          | Soft-delete item (sets deleted_at).                               |

### Stats
| Method | Path   | Query params          | Response                                      |
|--------|--------|-----------------------|-----------------------------------------------|
| GET    | /stats | `?year=YYYY&month=M`  | `{ "added": int, "consumed": int, "wasted": int }` |

Defaults to current year/month if params omitted. "Wasted" for stats means all items in the requested month where `expiry_date` falls within that month, `consumed = false`, and `deleted_at IS NULL` — this is a full-month count, distinct from the weekly digest which uses a rolling 7-day lookback.

All endpoints except `/auth/*` require `Authorization: Bearer <token>` header.

---

## Pages & Features

### Auth
- `/login` — email + password form, stores JWT in `localStorage`
- `/register` — name, email, password
- No email verification, no OAuth

### Onboarding
- After login, frontend calls `GET /households/me`. If 404 → redirect to `/onboarding`.
- `/onboarding` — two options: **Create household** (name → get invite code) or **Join household** (enter invite code)
- Users belong to exactly one household. Once onboarded, `GET /households/me` returns 200 and onboarding is not shown again.

### Dashboard `/`
- Items grouped in 3 urgency lanes (filter: `?consumed=false&active_only=true`):
  - 🔴 **Expires soon** — `expiry_date <= today + 2 days` (aligns with digest threshold)
  - 🟡 **This week** — `expiry_date` in 3–7 days
  - 🟢 **Fine** — 8+ days
- Quick-add button → name, category, expiry date, quantity, unit
- Click item → edit (opens edit form), mark consumed, or delete
- Header shows household name + invite code for sharing

### Stats `/stats`
- Monthly bar chart (Recharts): items added vs consumed vs wasted
- Defaults to current month, month picker to navigate back
- Fetches `GET /stats?year=YYYY&month=M`

---

## Email Digest

### Daily Digest (fires at DIGEST_CRON_HOUR daily)
- For each household: query items with `expiry_date <= today + 2 days`, `consumed = false`, `deleted_at IS NULL`
- If no urgent items → skip (no email sent, no log entry)
- Otherwise: send one email per household member, log to `digest_logs` with `digest_type = daily`

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

### Weekly Waste Summary (fires at DIGEST_CRON_HOUR on DIGEST_WEEKLY_DAY)
- For each household: query items with `expiry_date` in previous 7 days, `consumed = false`, `deleted_at IS NULL` → these are wasted
- If 0 wasted items → skip
- Otherwise: send summary email, log to `digest_logs` with `digest_type = weekly`

**Email content:**
```
Subject: 📊 Tracepack — your week in food

Hi [name],

Last week in [household]:
  • Added: 12 items
  • Consumed: 9 items
  • Wasted: 3 items (Milk, Spinach, Bread)

Keep it up — every item consumed is food (and money) saved.
```

---

## Commit Strategy

Commits are spread across ~6 weeks with backdated timestamps to reflect realistic development pace.

### Phase 1 — Scaffold (~6 commits, week 1)
- `chore: init next.js frontend`
- `chore: init fastapi backend`
- `chore: add docker-compose with postgres and mailhog`
- `chore: add alembic and initial migrations`
- `chore: add github actions ci workflow`
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
- `feat: list items by household with filters`
- `feat: mark item as consumed`
- `feat: soft delete item`
- `feat: update item fields`
- `fix: expiry date timezone handling`
- `refactor: item schema validation`

### Phase 4 — Frontend (~8 commits, weeks 4–5)
- `feat: login and register pages`
- `feat: household onboarding flow`
- `feat: dashboard with expiry urgency lanes`
- `feat: quick-add item form`
- `feat: edit, consumed and delete item actions`
- `feat: stats page with waste chart`
- `fix: mobile layout on dashboard`
- `chore: add loading and empty states`

### Phase 5 — Digest & Polish (~6 commits, week 6)
- `feat: daily digest scheduler with apscheduler`
- `feat: html email template for daily digest`
- `feat: weekly waste summary scheduler job`
- `feat: weekly waste summary email template`
- `fix: skip digest when no urgent items`
- `docs: update README with email configuration`

---

## Tech Stack Summary

| Layer      | Technology                                                        |
|------------|-------------------------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind, shadcn/ui, Recharts            |
| Backend    | FastAPI, SQLAlchemy 2, Alembic, APScheduler, bcrypt, python-jose |
| Database   | PostgreSQL 15                                                     |
| Email      | aiosmtplib + Jinja2 templates                                     |
| Dev email  | Mailhog                                                           |
| Containers | Docker Compose                                                    |
| CI         | GitHub Actions — `ruff` lint (backend) + `next build` (frontend) |

---

## Out of Scope

- Live deployment
- Real OAuth / Auth0
- Push notifications
- Mobile app
- Multi-household membership per user
- Item barcode scanning
- Per-user email digest preferences / unsubscribe
- Item editing history / audit log
