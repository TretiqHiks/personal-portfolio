# CronVault — Design Spec
*Date: 2026-03-22*

## Overview

CronVault is a self-hosted cron job manager with a web UI. It lets a single user define scheduled jobs (HTTP requests or shell commands), monitors their execution, retains 30 days of run history, and surfaces failures visually on a dashboard.

---

## Goals

- Define, edit, enable/disable, and manually trigger HTTP and shell jobs
- Track every run: status, duration, output
- Surface failed jobs clearly on the dashboard without email
- Keep 30 days of run history; purge older records automatically
- Run entirely on localhost via `docker compose up`

---

## Architecture

Two services in Docker Compose:

### Backend (FastAPI + APScheduler + SQLite)
- Owns the scheduler — APScheduler with an **in-memory job store** (not SQLite job store)
- On startup, reads all enabled jobs from the `jobs` table and registers them with APScheduler. The `jobs` table is the single source of truth; APScheduler's in-memory state is always derived from it.
- Executes jobs: HTTP via `httpx`, shell via `subprocess`
- Exposes a REST API consumed by the frontend
- Runs a nightly APScheduler job to purge runs older than 30 days
- Single SQLite file (`data/cronvault.db`) mounted as a Docker volume

### Frontend (Next.js)
- Client-side data fetching against the backend API
- No SSR required
- Served on port 3000; backend on port 8000

---

## Data Model

### `jobs`

| Column | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | Primary key |
| name | TEXT | Human-readable label |
| type | TEXT | `http` or `shell` |
| cron_expression | TEXT | Standard 5-field cron |
| config | TEXT (JSON) | Type-specific config (see below) |
| enabled | INTEGER | 0 or 1 |
| created_at | TEXT (ISO8601) | |
| updated_at | TEXT (ISO8601) | Updated on every PUT/PATCH |

**HTTP config shape:**
```json
{ "url": "...", "method": "GET", "headers": {}, "body": null, "expected_status": 200, "timeout_seconds": 30 }
```

**Shell config shape:**
```json
{ "command": "...", "working_dir": "/", "timeout_seconds": 30 }
```

### `runs`

| Column | Type | Notes |
|---|---|---|
| id | TEXT (UUID) | Primary key |
| job_id | TEXT | FK → jobs.id (CASCADE DELETE) |
| started_at | TEXT (ISO8601) | |
| finished_at | TEXT (ISO8601) | Null while running |
| status | TEXT | `running`, `success`, `failure` |
| output | TEXT | Truncated to 10,000 characters |
| duration_ms | INTEGER | Null while running |

**Required index:** `CREATE INDEX idx_runs_job_started ON runs(job_id, started_at DESC)`

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /jobs | List all jobs with enriched summary |
| POST | /jobs | Create a job |
| GET | /jobs/{id} | Get job detail with enriched summary |
| PUT | /jobs/{id} | Update a job |
| DELETE | /jobs/{id} | Delete a job and its runs |
| PATCH | /jobs/{id}/toggle | Enable or disable a job |
| POST | /jobs/{id}/trigger | Manually trigger a job immediately |
| GET | /jobs/{id}/runs | Paginated run history for a job |

### Response shapes

**`GET /jobs` — job list item:**
```json
{
  "id": "...",
  "name": "...",
  "type": "http",
  "cron_expression": "0 * * * *",
  "enabled": true,
  "created_at": "...",
  "updated_at": "...",
  "next_run_time": "2026-03-22T15:00:00Z",
  "last_run": {
    "status": "success",
    "started_at": "...",
    "duration_ms": 142
  },
  "failure_streak": 0
}
```

`next_run_time` is read from APScheduler's in-memory state for enabled jobs; `null` for disabled jobs.

`failure_streak` is computed server-side: count of consecutive `failure` runs at the head of the most recent run history for this job (most recent first). Resets to 0 on the first `success`.

`last_run` is `null` if the job has never run.

**`GET /jobs/{id}/runs` — paginated:**

Query params: `limit` (default 50, max 200), `offset` (default 0).

```json
{
  "total": 312,
  "limit": 50,
  "offset": 0,
  "items": [
    {
      "id": "...",
      "started_at": "...",
      "finished_at": "...",
      "status": "success",
      "output": "...",
      "duration_ms": 142
    }
  ]
}
```

**`POST /jobs/{id}/trigger` — concurrent guard:**

Returns `HTTP 409` with `{ "detail": "A run for this job is already in progress" }` if the job has a run with `status = "running"`. Otherwise fires immediately and returns `HTTP 202` with the new run id.

---

## Frontend Pages

### Dashboard (`/`)
- Table/grid of all jobs
- Per-job: name, type badge, cron expression, next run time, last run status badge (green/red/grey), failure streak count
- Quick enable/disable toggle
- Manual trigger button
- Click row → job detail

### Job Detail (`/jobs/[id]`)
- Run history table (paginated, last 30 days): started_at, duration, status, output excerpt
- Duration line chart (Recharts) over the last 30 days
- Edit and delete actions

### Create / Edit Job (`/jobs/new`, `/jobs/[id]/edit`)
- Form: name, type selector, cron expression with human-readable preview, type-specific config fields, timeout
- Invalid cron expression shows an inline validation error before submission

---

## Key Behaviours

- **Failure streak**: computed server-side on `GET /jobs` and `GET /jobs/{id}`. Walk most-recent runs first; count consecutive failures before the first success.
- **Concurrent run guard**: scheduler checks for an active `running` row before starting a new execution. Skipped executions are silently dropped (not logged). Manual trigger via `POST /jobs/{id}/trigger` returns `HTTP 409` if a run is already in progress.
- **Retention**: a nightly APScheduler job deletes all runs where `started_at < now - 30 days`.
- **Orphaned runs**: deleting a job cascades to delete all its runs (SQLite `ON DELETE CASCADE`).
- **Output truncation**: output is capped at 10,000 characters before being written to the database. Truncated output appends `\n[output truncated]`.
- **Timeout behaviour**: if a job exceeds `timeout_seconds`, the run is marked `status = "failure"` and output is set to `"[timeout after {n}s]"`.
- **Invalid cron**: `POST /jobs` and `PUT /jobs/{id}` return `HTTP 422` with a descriptive error if the cron expression is invalid or not a standard 5-field expression.
- **Scheduler sync on startup**: FastAPI startup event reads all rows where `enabled = 1` from the `jobs` table and registers them with APScheduler. The `jobs` table is always the source of truth; APScheduler holds no persistent state.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, Recharts |
| Backend | FastAPI, APScheduler, SQLAlchemy (Core), httpx |
| Database | SQLite |
| Containers | Docker Compose |

---

## Out of Scope

- Multi-user auth
- Email / webhook alerting
- Distributed execution
- Job dependencies / chaining
