# CronVault Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-hosted cron job manager (HTTP + shell jobs) with a web dashboard, 30-day run history, and in-dashboard failure visibility.

**Architecture:** FastAPI backend owns an in-memory APScheduler instance that syncs from SQLite on startup. All job state lives in SQLite (`jobs` + `runs` tables). Next.js frontend does client-side fetching only.

**Tech Stack:** Python 3.12, FastAPI 0.115, APScheduler 3.10, SQLAlchemy 2 Core, httpx, croniter — Next.js 15, TypeScript, Tailwind CSS 4, Recharts, cronstrue — SQLite — Docker Compose

---

## File Map

```
cronvault/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app, lifespan (scheduler start/stop), CORS
│   │   ├── database.py      # engine, get_conn(), create_tables()
│   │   ├── models.py        # SQLAlchemy Core Table objects (jobs, runs)
│   │   ├── schemas.py       # Pydantic models for all request/response shapes
│   │   ├── executor.py      # run_http_job(), run_shell_job() — pure functions
│   │   ├── scheduler.py     # scheduler instance, sync_from_db(), schedule_job()
│   │   └── routers/
│   │       ├── __init__.py
│   │       └── jobs.py      # All endpoints: CRUD, toggle, trigger, runs
│   └── tests/
│       ├── conftest.py      # In-memory SQLite app, TestClient fixture
│       ├── test_executor.py
│       ├── test_jobs.py
│       ├── test_runs.py
│       └── test_scheduler.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── next.config.ts
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                    # Dashboard
    │   └── jobs/
    │       ├── new/page.tsx            # Create job
    │       └── [id]/
    │           ├── page.tsx            # Job detail
    │           └── edit/page.tsx       # Edit job
    ├── components/
    │   ├── StatusBadge.tsx
    │   ├── JobTable.tsx
    │   ├── JobForm.tsx
    │   ├── RunHistoryTable.tsx
    │   └── DurationChart.tsx
    └── lib/
        ├── types.ts
        └── api.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `cronvault/backend/requirements.txt`
- Create: `cronvault/.env.example`
- Create: `cronvault/docker-compose.yml` (skeleton — finalized in Task 8)
- Create: `cronvault/backend/app/__init__.py`
- Create: `cronvault/backend/app/routers/__init__.py`

- [ ] **Step 1: Create the project directory structure**

```bash
mkdir -p ~/Desktop/cronvault/backend/app/routers
mkdir -p ~/Desktop/cronvault/backend/tests
mkdir -p ~/Desktop/cronvault/frontend
touch ~/Desktop/cronvault/backend/app/__init__.py
touch ~/Desktop/cronvault/backend/app/routers/__init__.py
cd ~/Desktop/cronvault
```

- [ ] **Step 2: Write `backend/requirements.txt`**

```
fastapi==0.115.6
uvicorn[standard]==0.32.1
apscheduler==3.10.4
sqlalchemy==2.0.36
httpx==0.28.1
croniter==3.0.3
pydantic==2.10.3

# dev/test
pytest==8.3.4
pytest-mock==3.14.0
requests==2.32.3
```

- [ ] **Step 3: Write `.env.example`**

```
DATABASE_URL=sqlite:////data/cronvault.db
BACKEND_CORS_ORIGINS=http://localhost:3000
```

- [ ] **Step 4: Write `docker-compose.yml` skeleton (finalized in Task 8)**

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - cronvault_data:/data
    environment:
      - DATABASE_URL=sqlite:////data/cronvault.db
      - BACKEND_CORS_ORIGINS=http://localhost:3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 5s
      timeout: 3s
      retries: 5

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      backend:
        condition: service_healthy

volumes:
  cronvault_data:
```

- [ ] **Step 5: Commit**

```bash
cd ~/Desktop/cronvault
git init .
git add .
git commit -m "chore: project scaffold"
```

---

## Task 2: Database Layer

**Files:**
- Create: `backend/app/models.py`
- Create: `backend/app/database.py`
- Create: `backend/app/main.py` (minimal stub — expanded in Task 8)
- Create: `backend/tests/conftest.py`

- [ ] **Step 1: Write `app/models.py`**

```python
from sqlalchemy import Table, Column, Text, Integer, ForeignKey, MetaData

metadata = MetaData()

jobs = Table(
    "jobs",
    metadata,
    Column("id", Text, primary_key=True),
    Column("name", Text, nullable=False),
    Column("type", Text, nullable=False),          # "http" | "shell"
    Column("cron_expression", Text, nullable=False),
    Column("config", Text, nullable=False),        # JSON string
    Column("enabled", Integer, nullable=False, default=1),
    Column("created_at", Text, nullable=False),
    Column("updated_at", Text, nullable=False),
)

runs = Table(
    "runs",
    metadata,
    Column("id", Text, primary_key=True),
    Column("job_id", Text, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False),
    Column("started_at", Text, nullable=False),
    Column("finished_at", Text),
    Column("status", Text, nullable=False),        # "running" | "success" | "failure"
    Column("output", Text),
    Column("duration_ms", Integer),
)
```

- [ ] **Step 2: Write `app/database.py`**

```python
import os
from sqlalchemy import create_engine, text, event
from sqlalchemy.engine import Engine
from app.models import metadata

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cronvault.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


@event.listens_for(Engine, "connect")
def enable_foreign_keys(dbapi_conn, _):
    """Enable SQLite foreign key enforcement on every new connection."""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def create_tables() -> None:
    metadata.create_all(engine)
    with engine.connect() as conn:
        conn.execute(text(
            "CREATE INDEX IF NOT EXISTS idx_runs_job_started "
            "ON runs(job_id, started_at DESC)"
        ))
        conn.commit()


def get_conn():
    with engine.connect() as conn:
        yield conn
```

- [ ] **Step 3: Write a minimal `app/main.py` stub** (needed so tests can import the app)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield  # scheduler wired up in Task 8


app = FastAPI(title="CronVault", lifespan=lifespan)
```

- [ ] **Step 4: Write `tests/conftest.py`**

Each test function gets its own clean in-memory database. The app is imported lazily inside the fixture so the engine patch happens before any module-level SQLAlchemy state is evaluated.

```python
import pytest
from sqlalchemy import create_engine
from app.models import metadata, jobs, runs


@pytest.fixture()
def test_engine():
    """Fresh in-memory SQLite DB per test — no cross-test contamination."""
    eng = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture()
def client(test_engine, monkeypatch):
    """TestClient with database overridden to the per-test in-memory engine."""
    import app.database as db_module
    monkeypatch.setattr(db_module, "engine", test_engine)

    # Import app *after* patching the engine so all module-level engine refs pick up the test engine
    from app.main import app
    from app.database import get_conn
    from fastapi.testclient import TestClient

    def override_get_conn():
        with test_engine.connect() as conn:
            yield conn

    app.dependency_overrides[get_conn] = override_get_conn

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
```

- [ ] **Step 5: Verify tables create without error**

```bash
cd ~/Desktop/cronvault/backend
pip install -r requirements.txt
python -c "from app.database import create_tables; create_tables(); print('OK')"
```

Expected: `OK`

- [ ] **Step 6: Commit**

```bash
git add backend/app/models.py backend/app/database.py backend/app/main.py backend/tests/conftest.py backend/app/__init__.py backend/app/routers/__init__.py
git commit -m "feat: database layer — jobs + runs tables with FK cascade and index"
```

---

## Task 3: Schemas

**Files:**
- Create: `backend/app/schemas.py`

Schemas are validated implicitly by router tests. No separate test file.

- [ ] **Step 1: Write `app/schemas.py`**

```python
from __future__ import annotations
from typing import Any, Optional
from pydantic import BaseModel, field_validator
from croniter import croniter


def _validate_cron(expr: str) -> str:
    parts = expr.strip().split()
    if len(parts) != 5:
        raise ValueError("cron_expression must have exactly 5 fields")
    if not croniter.is_valid(expr):
        raise ValueError(f"Invalid cron expression: {expr!r}")
    return expr


# ── Request bodies ────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    name: str
    type: str                      # "http" | "shell"
    cron_expression: str
    config: dict[str, Any]
    enabled: bool = True

    @field_validator("type")
    @classmethod
    def type_must_be_valid(cls, v: str) -> str:
        if v not in ("http", "shell"):
            raise ValueError("type must be 'http' or 'shell'")
        return v

    @field_validator("cron_expression")
    @classmethod
    def cron_must_be_valid(cls, v: str) -> str:
        return _validate_cron(v)


class JobUpdate(JobCreate):
    pass


# ── Response bodies ───────────────────────────────────────────────────────────

class LastRun(BaseModel):
    status: str
    started_at: str
    duration_ms: Optional[int]


class JobOut(BaseModel):
    id: str
    name: str
    type: str
    cron_expression: str
    config: dict[str, Any]
    enabled: bool
    created_at: str
    updated_at: str
    next_run_time: Optional[str]
    last_run: Optional[LastRun]
    failure_streak: int


class RunOut(BaseModel):
    id: str
    started_at: str
    finished_at: Optional[str]
    status: str
    output: Optional[str]
    duration_ms: Optional[int]


class RunPage(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[RunOut]


class TriggerOut(BaseModel):
    run_id: str
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/schemas.py
git commit -m "feat: pydantic schemas with cron validation"
```

---

## Task 4: Executor

**Files:**
- Create: `backend/app/executor.py`
- Test: `backend/tests/test_executor.py`

Pure functions — no database, no scheduler. Can be tested without the app.

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_executor.py
from unittest.mock import patch, MagicMock
from app.executor import run_http_job, run_shell_job, OUTPUT_LIMIT

SENTINEL = "\n[output truncated]"


class TestRunShellJob:
    def test_success(self):
        status, output, duration_ms = run_shell_job(
            command="echo hello", working_dir="/", timeout_seconds=10
        )
        assert status == "success"
        assert "hello" in output
        assert duration_ms >= 0

    def test_failure_nonzero_exit(self):
        status, output, _ = run_shell_job(
            command="bash -c 'exit 1'", working_dir="/", timeout_seconds=10
        )
        assert status == "failure"

    def test_timeout(self):
        status, output, _ = run_shell_job(
            command="sleep 60", working_dir="/", timeout_seconds=1
        )
        assert status == "failure"
        assert "timeout" in output.lower()

    def test_output_truncated(self):
        long_cmd = f"python3 -c \"print('x' * {OUTPUT_LIMIT + 500})\""
        status, output, _ = run_shell_job(command=long_cmd, working_dir="/", timeout_seconds=10)
        assert len(output) <= OUTPUT_LIMIT + len(SENTINEL)
        assert output.endswith(SENTINEL)


class TestRunHttpJob:
    def test_success(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = "OK"
        with patch("app.executor.httpx.request", return_value=mock_resp):
            status, output, duration_ms = run_http_job(
                url="http://example.com", method="GET", headers={},
                body=None, expected_status=200, timeout_seconds=10,
            )
        assert status == "success"
        assert duration_ms >= 0

    def test_unexpected_status(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 404
        mock_resp.text = "Not Found"
        with patch("app.executor.httpx.request", return_value=mock_resp):
            status, output, _ = run_http_job(
                url="http://example.com", method="GET", headers={},
                body=None, expected_status=200, timeout_seconds=10,
            )
        assert status == "failure"
        assert "404" in output

    def test_timeout(self):
        import httpx
        with patch("app.executor.httpx.request", side_effect=httpx.TimeoutException("timed out")):
            status, output, _ = run_http_job(
                url="http://example.com", method="GET", headers={},
                body=None, expected_status=200, timeout_seconds=5,
            )
        assert status == "failure"
        assert "timeout" in output.lower()

    def test_output_truncated(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = "x" * (OUTPUT_LIMIT + 500)
        with patch("app.executor.httpx.request", return_value=mock_resp):
            status, output, _ = run_http_job(
                url="http://example.com", method="GET", headers={},
                body=None, expected_status=200, timeout_seconds=10,
            )
        assert output.endswith(SENTINEL)
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
cd ~/Desktop/cronvault/backend
pytest tests/test_executor.py -v
```

Expected: `ModuleNotFoundError` — executor not written yet

- [ ] **Step 3: Write `app/executor.py`**

```python
import subprocess
import time
from typing import Optional
import httpx

OUTPUT_LIMIT = 10_000
_TRUNCATED = "\n[output truncated]"


def _truncate(text: str) -> str:
    if len(text) > OUTPUT_LIMIT:
        return text[:OUTPUT_LIMIT] + _TRUNCATED
    return text


def run_shell_job(
    command: str, working_dir: str, timeout_seconds: int
) -> tuple[str, str, int]:
    start = time.monotonic()
    try:
        result = subprocess.run(
            command, shell=True, cwd=working_dir,
            capture_output=True, text=True, timeout=timeout_seconds,
        )
        duration_ms = int((time.monotonic() - start) * 1000)
        output = _truncate((result.stdout + result.stderr).strip())
        status = "success" if result.returncode == 0 else "failure"
        return status, output, duration_ms
    except subprocess.TimeoutExpired:
        duration_ms = int((time.monotonic() - start) * 1000)
        return "failure", f"[timeout after {timeout_seconds}s]", duration_ms


def run_http_job(
    url: str, method: str, headers: dict, body: Optional[str],
    expected_status: int, timeout_seconds: int,
) -> tuple[str, str, int]:
    start = time.monotonic()
    try:
        resp = httpx.request(method, url, headers=headers, content=body, timeout=timeout_seconds)
        duration_ms = int((time.monotonic() - start) * 1000)
        output = _truncate(resp.text)
        if resp.status_code != expected_status:
            return "failure", f"[status {resp.status_code}] {output}", duration_ms
        return "success", output, duration_ms
    except httpx.TimeoutException:
        duration_ms = int((time.monotonic() - start) * 1000)
        return "failure", f"[timeout after {timeout_seconds}s]", duration_ms
    except Exception as exc:
        duration_ms = int((time.monotonic() - start) * 1000)
        return "failure", f"[error] {exc}", duration_ms
```

- [ ] **Step 4: Run tests — all must pass**

```bash
pytest tests/test_executor.py -v
```

Expected: all green

- [ ] **Step 5: Commit**

```bash
git add backend/app/executor.py backend/tests/test_executor.py
git commit -m "feat: job executor — HTTP and shell with timeout and output truncation"
```

---

## Task 5: Scheduler

**Files:**
- Create: `backend/app/scheduler.py`
- Test: `backend/tests/test_scheduler.py`

- [ ] **Step 1: Write `tests/test_scheduler.py`**

```python
# tests/test_scheduler.py
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import insert
from app.models import runs as runs_table
from app.scheduler import purge_old_runs


def _make_run(job_id: str, started_at: str, status: str = "success"):
    return {
        "id": str(uuid.uuid4()),
        "job_id": job_id,
        "started_at": started_at,
        "finished_at": started_at,
        "status": status,
        "output": "ok",
        "duration_ms": 50,
    }


def test_purge_removes_runs_older_than_30_days(test_engine):
    # Insert a job row first (required by FK)
    from sqlalchemy import insert as ins
    from app.models import jobs as jobs_table
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    with test_engine.connect() as conn:
        conn.execute(ins(jobs_table).values(
            id=job_id, name="test", type="shell",
            cron_expression="* * * * *",
            config='{"command":"echo hi","working_dir":"/","timeout_seconds":5}',
            enabled=0, created_at=now.isoformat(), updated_at=now.isoformat(),
        ))
        old = (now - timedelta(days=31)).isoformat()
        recent = (now - timedelta(days=1)).isoformat()
        conn.execute(insert(runs_table).values(**_make_run(job_id, old)))
        conn.execute(insert(runs_table).values(**_make_run(job_id, recent)))
        conn.commit()

    purge_old_runs(test_engine)

    with test_engine.connect() as conn:
        from sqlalchemy import select, func
        count = conn.execute(
            select(func.count()).select_from(runs_table).where(runs_table.c.job_id == job_id)
        ).scalar()
    assert count == 1  # only the recent run remains


def test_purge_keeps_runs_within_30_days(test_engine):
    from sqlalchemy import insert as ins
    from app.models import jobs as jobs_table
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    with test_engine.connect() as conn:
        conn.execute(ins(jobs_table).values(
            id=job_id, name="test2", type="shell",
            cron_expression="* * * * *",
            config='{"command":"echo hi","working_dir":"/","timeout_seconds":5}',
            enabled=0, created_at=now.isoformat(), updated_at=now.isoformat(),
        ))
        for days_ago in [1, 7, 29]:
            ts = (now - timedelta(days=days_ago)).isoformat()
            conn.execute(insert(runs_table).values(**_make_run(job_id, ts)))
        conn.commit()

    purge_old_runs(test_engine)

    with test_engine.connect() as conn:
        from sqlalchemy import select, func
        count = conn.execute(
            select(func.count()).select_from(runs_table).where(runs_table.c.job_id == job_id)
        ).scalar()
    assert count == 3
```

- [ ] **Step 2: Run to confirm failure**

```bash
pytest tests/test_scheduler.py -v
```

Expected: `ModuleNotFoundError`

- [ ] **Step 3: Write `app/scheduler.py`**

```python
import json
import uuid
from datetime import datetime, timezone, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select, insert, update
from sqlalchemy.engine import Connection, Engine

from app.models import jobs as jobs_table, runs as runs_table
from app.executor import run_http_job, run_shell_job

scheduler = BackgroundScheduler()


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def _has_running_run(conn: Connection, job_id: str) -> bool:
    row = conn.execute(
        select(runs_table.c.id)
        .where(runs_table.c.job_id == job_id)
        .where(runs_table.c.status == "running")
        .limit(1)
    ).fetchone()
    return row is not None


def execute_job(job_id: str, db_engine: Engine) -> str | None:
    """Execute one job run. Returns run_id or None if skipped (concurrent guard)."""
    with db_engine.connect() as conn:
        if _has_running_run(conn, job_id):
            return None  # silently skip

        job_row = conn.execute(
            select(jobs_table).where(jobs_table.c.id == job_id)
        ).fetchone()
        if job_row is None:
            return None

        run_id = str(uuid.uuid4())
        conn.execute(insert(runs_table).values(
            id=run_id, job_id=job_id,
            started_at=_utcnow(), finished_at=None,
            status="running", output=None, duration_ms=None,
        ))
        conn.commit()

    config = json.loads(job_row.config)

    if job_row.type == "http":
        status, output, duration_ms = run_http_job(
            url=config["url"], method=config.get("method", "GET"),
            headers=config.get("headers", {}), body=config.get("body"),
            expected_status=config.get("expected_status", 200),
            timeout_seconds=config.get("timeout_seconds", 30),
        )
    else:
        status, output, duration_ms = run_shell_job(
            command=config["command"],
            working_dir=config.get("working_dir", "/"),
            timeout_seconds=config.get("timeout_seconds", 30),
        )

    with db_engine.connect() as conn:
        conn.execute(
            update(runs_table)
            .where(runs_table.c.id == run_id)
            .values(finished_at=_utcnow(), status=status, output=output, duration_ms=duration_ms)
        )
        conn.commit()

    return run_id


def schedule_job(job_id: str, cron_expression: str, db_engine: Engine) -> None:
    scheduler.add_job(
        execute_job,
        trigger=CronTrigger.from_crontab(cron_expression),
        id=job_id,
        args=[job_id, db_engine],
        replace_existing=True,
        misfire_grace_time=60,
    )


def remove_job(job_id: str) -> None:
    try:
        scheduler.remove_job(job_id)
    except Exception:
        pass


def sync_from_db(db_engine: Engine) -> None:
    """Load all enabled jobs from DB and register with APScheduler on startup."""
    with db_engine.connect() as conn:
        rows = conn.execute(
            select(jobs_table).where(jobs_table.c.enabled == 1)
        ).fetchall()
    for row in rows:
        schedule_job(row.id, row.cron_expression, db_engine)


def purge_old_runs(db_engine: Engine) -> None:
    """Delete runs older than 30 days. Called nightly."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    with db_engine.connect() as conn:
        conn.execute(runs_table.delete().where(runs_table.c.started_at < cutoff))
        conn.commit()
```

- [ ] **Step 4: Run tests — all must pass**

```bash
pytest tests/test_scheduler.py -v
```

Expected: all green

- [ ] **Step 5: Commit**

```bash
git add backend/app/scheduler.py backend/tests/test_scheduler.py
git commit -m "feat: APScheduler integration — sync, execute, purge with tests"
```

---

## Task 6: Jobs Router

**Files:**
- Create: `backend/app/routers/jobs.py`
- Test: `backend/tests/test_jobs.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_jobs.py
import pytest

VALID_HTTP_JOB = {
    "name": "Health check",
    "type": "http",
    "cron_expression": "* * * * *",
    "config": {
        "url": "http://localhost",
        "method": "GET",
        "headers": {},
        "body": None,
        "expected_status": 200,
        "timeout_seconds": 5,
    },
    "enabled": True,
}

VALID_SHELL_JOB = {
    "name": "Echo test",
    "type": "shell",
    "cron_expression": "0 * * * *",
    "config": {"command": "echo hi", "working_dir": "/", "timeout_seconds": 5},
    "enabled": True,
}


def test_create_job(client):
    r = client.post("/jobs", json=VALID_HTTP_JOB)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Health check"
    assert data["failure_streak"] == 0
    assert data["last_run"] is None


def test_create_job_invalid_cron(client):
    bad = {**VALID_HTTP_JOB, "cron_expression": "not-a-cron"}
    r = client.post("/jobs", json=bad)
    assert r.status_code == 422


def test_create_job_invalid_type(client):
    bad = {**VALID_HTTP_JOB, "type": "ftp"}
    r = client.post("/jobs", json=bad)
    assert r.status_code == 422


def test_list_jobs(client):
    client.post("/jobs", json=VALID_HTTP_JOB)
    r = client.get("/jobs")
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_get_job(client):
    job_id = client.post("/jobs", json=VALID_HTTP_JOB).json()["id"]
    r = client.get(f"/jobs/{job_id}")
    assert r.status_code == 200
    assert r.json()["id"] == job_id


def test_get_job_not_found(client):
    r = client.get("/jobs/nonexistent")
    assert r.status_code == 404


def test_update_job(client):
    job_id = client.post("/jobs", json=VALID_HTTP_JOB).json()["id"]
    updated = {**VALID_HTTP_JOB, "name": "Updated name"}
    r = client.put(f"/jobs/{job_id}", json=updated)
    assert r.status_code == 200
    assert r.json()["name"] == "Updated name"


def test_delete_job(client):
    job_id = client.post("/jobs", json=VALID_HTTP_JOB).json()["id"]
    r = client.delete(f"/jobs/{job_id}")
    assert r.status_code == 204
    assert client.get(f"/jobs/{job_id}").status_code == 404


def test_toggle_job(client):
    job_id = client.post("/jobs", json=VALID_HTTP_JOB).json()["id"]
    r = client.patch(f"/jobs/{job_id}/toggle")
    assert r.status_code == 200
    assert r.json()["enabled"] is False


def test_trigger_job(client, monkeypatch):
    import app.scheduler as sched
    monkeypatch.setattr(sched, "execute_job", lambda job_id, engine: "fake-run-id")
    job_id = client.post("/jobs", json=VALID_SHELL_JOB).json()["id"]
    r = client.post(f"/jobs/{job_id}/trigger")
    assert r.status_code == 202
    assert r.json()["run_id"] == "fake-run-id"


def test_trigger_returns_409_when_running(client, monkeypatch):
    import app.routers.jobs as jobs_router
    monkeypatch.setattr(jobs_router, "_has_active_run", lambda conn, job_id: True)
    job_id = client.post("/jobs", json=VALID_SHELL_JOB).json()["id"]
    r = client.post(f"/jobs/{job_id}/trigger")
    assert r.status_code == 409
```

- [ ] **Step 2: Run to confirm failure**

```bash
pytest tests/test_jobs.py -v
```

Expected: `ImportError` — router not written

- [ ] **Step 3: Write `app/routers/jobs.py`**

```python
import json
import uuid
from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, insert, update, delete, func
from sqlalchemy.engine import Connection

from app.database import get_conn, engine as db_engine
from app.models import jobs as jobs_table, runs as runs_table
from app.schemas import JobCreate, JobUpdate, JobOut, LastRun, TriggerOut, RunPage, RunOut
import app.scheduler as scheduler_module

router = APIRouter(prefix="/jobs", tags=["jobs"])

Conn = Annotated[Connection, Depends(get_conn)]


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def _has_active_run(conn: Connection, job_id: str) -> bool:
    row = conn.execute(
        select(runs_table.c.id)
        .where(runs_table.c.job_id == job_id)
        .where(runs_table.c.status == "running")
        .limit(1)
    ).fetchone()
    return row is not None


def _failure_streak(conn: Connection, job_id: str) -> int:
    rows = conn.execute(
        select(runs_table.c.status)
        .where(runs_table.c.job_id == job_id)
        .where(runs_table.c.status != "running")
        .order_by(runs_table.c.started_at.desc())
        .limit(100)
    ).fetchall()
    streak = 0
    for row in rows:
        if row.status == "failure":
            streak += 1
        else:
            break
    return streak


def _last_run(conn: Connection, job_id: str) -> Optional[LastRun]:
    row = conn.execute(
        select(runs_table)
        .where(runs_table.c.job_id == job_id)
        .where(runs_table.c.status != "running")
        .order_by(runs_table.c.started_at.desc())
        .limit(1)
    ).fetchone()
    if row is None:
        return None
    return LastRun(status=row.status, started_at=row.started_at, duration_ms=row.duration_ms)


def _next_run_time(job_id: str, enabled: bool) -> Optional[str]:
    if not enabled:
        return None
    try:
        job = scheduler_module.scheduler.get_job(job_id)
        if job and job.next_run_time:
            return job.next_run_time.isoformat()
    except Exception:
        pass
    return None


def _enrich(conn: Connection, row) -> JobOut:
    enabled = bool(row.enabled)
    return JobOut(
        id=row.id, name=row.name, type=row.type,
        cron_expression=row.cron_expression,
        config=json.loads(row.config),
        enabled=enabled,
        created_at=row.created_at, updated_at=row.updated_at,
        next_run_time=_next_run_time(row.id, enabled),
        last_run=_last_run(conn, row.id),
        failure_streak=_failure_streak(conn, row.id),
    )


@router.get("", response_model=list[JobOut])
def list_jobs(conn: Conn):
    rows = conn.execute(select(jobs_table)).fetchall()
    return [_enrich(conn, r) for r in rows]


@router.post("", response_model=JobOut, status_code=201)
def create_job(body: JobCreate, conn: Conn):
    job_id = str(uuid.uuid4())
    now = _utcnow()
    conn.execute(insert(jobs_table).values(
        id=job_id, name=body.name, type=body.type,
        cron_expression=body.cron_expression,
        config=json.dumps(body.config),
        enabled=int(body.enabled),
        created_at=now, updated_at=now,
    ))
    conn.commit()
    if body.enabled:
        scheduler_module.schedule_job(job_id, body.cron_expression, db_engine)
    row = conn.execute(select(jobs_table).where(jobs_table.c.id == job_id)).fetchone()
    return _enrich(conn, row)


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str, conn: Conn):
    row = conn.execute(select(jobs_table).where(jobs_table.c.id == job_id)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return _enrich(conn, row)


@router.put("/{job_id}", response_model=JobOut)
def update_job(job_id: str, body: JobUpdate, conn: Conn):
    row = conn.execute(select(jobs_table).where(jobs_table.c.id == job_id)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    conn.execute(
        update(jobs_table).where(jobs_table.c.id == job_id).values(
            name=body.name, type=body.type,
            cron_expression=body.cron_expression,
            config=json.dumps(body.config),
            enabled=int(body.enabled),
            updated_at=_utcnow(),
        )
    )
    conn.commit()
    scheduler_module.remove_job(job_id)
    if body.enabled:
        scheduler_module.schedule_job(job_id, body.cron_expression, db_engine)
    row = conn.execute(select(jobs_table).where(jobs_table.c.id == job_id)).fetchone()
    return _enrich(conn, row)


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: str, conn: Conn):
    row = conn.execute(select(jobs_table).where(jobs_table.c.id == job_id)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    conn.execute(delete(jobs_table).where(jobs_table.c.id == job_id))
    conn.commit()
    scheduler_module.remove_job(job_id)


@router.patch("/{job_id}/toggle", response_model=JobOut)
def toggle_job(job_id: str, conn: Conn):
    row = conn.execute(select(jobs_table).where(jobs_table.c.id == job_id)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    new_enabled = 0 if row.enabled else 1
    conn.execute(
        update(jobs_table).where(jobs_table.c.id == job_id)
        .values(enabled=new_enabled, updated_at=_utcnow())
    )
    conn.commit()
    scheduler_module.remove_job(job_id)
    if new_enabled:
        scheduler_module.schedule_job(job_id, row.cron_expression, db_engine)
    row = conn.execute(select(jobs_table).where(jobs_table.c.id == job_id)).fetchone()
    return _enrich(conn, row)


@router.post("/{job_id}/trigger", response_model=TriggerOut, status_code=202)
def trigger_job(job_id: str, conn: Conn):
    row = conn.execute(select(jobs_table).where(jobs_table.c.id == job_id)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if _has_active_run(conn, job_id):
        raise HTTPException(status_code=409, detail="A run for this job is already in progress")
    run_id = scheduler_module.execute_job(job_id, db_engine)
    return TriggerOut(run_id=run_id)


@router.get("/{job_id}/runs", response_model=RunPage)
def get_runs(job_id: str, conn: Conn, limit: int = 50, offset: int = 0):
    # Silently clamp at 200 (intentional — not a 422)
    limit = min(limit, 200)
    row = conn.execute(select(jobs_table).where(jobs_table.c.id == job_id)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Job not found")
    total = conn.execute(
        select(func.count()).select_from(runs_table).where(runs_table.c.job_id == job_id)
    ).scalar()
    items = conn.execute(
        select(runs_table)
        .where(runs_table.c.job_id == job_id)
        .order_by(runs_table.c.started_at.desc())
        .limit(limit).offset(offset)
    ).fetchall()
    return RunPage(
        total=total, limit=limit, offset=offset,
        items=[RunOut(**dict(r._mapping)) for r in items],
    )
```

> **Note on cascade delete:** The `DELETE /jobs/{id}` endpoint only deletes the `jobs` row. Runs are removed by SQLite's `ON DELETE CASCADE` (enabled via `PRAGMA foreign_keys=ON` in `database.py`). No manual run deletion needed in the router.

- [ ] **Step 4: Run all tests**

```bash
pytest tests/ -v
```

Expected: all green

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/jobs.py backend/tests/test_jobs.py
git commit -m "feat: jobs router — CRUD, toggle, trigger, run history"
```

---

## Task 7: Runs Endpoint Tests

**Files:**
- Test: `backend/tests/test_runs.py`

- [ ] **Step 1: Write `tests/test_runs.py`**

```python
# tests/test_runs.py
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import insert
from app.models import runs as runs_table, jobs as jobs_table

SHELL_JOB = {
    "name": "Run history test job",
    "type": "shell",
    "cron_expression": "0 * * * *",
    "config": {"command": "echo hi", "working_dir": "/", "timeout_seconds": 5},
    "enabled": False,
}


def _seed_runs(test_engine, job_id: str, statuses_oldest_first: list[str]):
    now = datetime.now(timezone.utc)
    with test_engine.connect() as conn:
        for i, status in enumerate(statuses_oldest_first):
            ts = (now - timedelta(minutes=len(statuses_oldest_first) - i)).isoformat()
            conn.execute(insert(runs_table).values(
                id=str(uuid.uuid4()), job_id=job_id,
                started_at=ts, finished_at=ts,
                status=status, output="out", duration_ms=100,
            ))
        conn.commit()


def test_run_history_pagination(client, test_engine):
    job_id = client.post("/jobs", json=SHELL_JOB).json()["id"]
    _seed_runs(test_engine, job_id, ["success", "failure", "failure", "success"])
    r = client.get(f"/jobs/{job_id}/runs?limit=2&offset=0")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 4
    assert data["limit"] == 2
    assert len(data["items"]) == 2


def test_run_history_sorted_desc(client, test_engine):
    job_id = client.post("/jobs", json=SHELL_JOB).json()["id"]
    _seed_runs(test_engine, job_id, ["success", "failure", "success"])
    items = client.get(f"/jobs/{job_id}/runs").json()["items"]
    dates = [i["started_at"] for i in items]
    assert dates == sorted(dates, reverse=True)


def test_failure_streak_consecutive(client, test_engine):
    # Seeded oldest-first: success, failure, failure → newest is failure,failure
    # streak = 2
    job_id = client.post("/jobs", json=SHELL_JOB).json()["id"]
    _seed_runs(test_engine, job_id, ["success", "failure", "failure"])
    assert client.get(f"/jobs/{job_id}").json()["failure_streak"] == 2


def test_failure_streak_resets_on_success(client, test_engine):
    # Newest is success → streak = 0
    job_id = client.post("/jobs", json=SHELL_JOB).json()["id"]
    _seed_runs(test_engine, job_id, ["failure", "failure", "success"])
    assert client.get(f"/jobs/{job_id}").json()["failure_streak"] == 0


def test_failure_streak_zero_no_runs(client):
    job_id = client.post("/jobs", json=SHELL_JOB).json()["id"]
    assert client.get(f"/jobs/{job_id}").json()["failure_streak"] == 0
```

- [ ] **Step 2: Run tests — all must pass**

```bash
pytest tests/test_runs.py -v
```

Expected: all green (router already implements runs endpoint)

- [ ] **Step 3: Commit**

```bash
git add backend/tests/test_runs.py
git commit -m "test: run history pagination and failure streak coverage"
```

---

## Task 8: Main App + Docker

**Files:**
- Modify: `backend/app/main.py` (expand the stub)
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`

- [ ] **Step 1: Expand `app/main.py`**

```python
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables, engine
from app.scheduler import scheduler, sync_from_db, purge_old_runs
from app.routers.jobs import router as jobs_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    scheduler.add_job(
        purge_old_runs, trigger="cron", hour=3, id="__purge__",
        args=[engine], replace_existing=True,
    )
    scheduler.start()
    sync_from_db(engine)
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="CronVault", lifespan=lifespan)

origins = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware, allow_origins=origins,
    allow_methods=["*"], allow_headers=["*"],
)

app.include_router(jobs_router)


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 2: Run full test suite one more time**

```bash
pytest tests/ -v
```

Expected: all green

- [ ] **Step 3: Write `backend/Dockerfile`**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 4: Write `frontend/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 5: Verify backend Docker build**

```bash
cd ~/Desktop/cronvault
docker build -t cronvault-backend ./backend
```

Expected: successful build

- [ ] **Step 6: Commit**

```bash
git add backend/app/main.py backend/Dockerfile frontend/Dockerfile
git commit -m "feat: full FastAPI app with health endpoint, scheduler lifespan, Docker"
```

---

## Task 9: Frontend Scaffold

**Files:**
- Create: `frontend/` (Next.js project via CLI)
- Create: `frontend/lib/types.ts`
- Create: `frontend/lib/api.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd ~/Desktop/cronvault
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

Accept all defaults.

- [ ] **Step 2: Install Recharts and cronstrue**

```bash
cd ~/Desktop/cronvault/frontend
npm install recharts cronstrue
npm install --save-dev @types/cronstrue
```

`cronstrue` converts cron expressions to human-readable English (e.g. `0 8 * * 1` → "At 08:00 AM, only on Monday").

- [ ] **Step 3: Write `lib/types.ts`**

```typescript
export interface LastRun {
  status: string;
  started_at: string;
  duration_ms: number | null;
}

export interface Job {
  id: string;
  name: string;
  type: "http" | "shell";
  cron_expression: string;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  next_run_time: string | null;
  last_run: LastRun | null;
  failure_streak: number;
}

export interface Run {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "failure";
  output: string | null;
  duration_ms: number | null;
}

export interface RunPage {
  total: number;
  limit: number;
  offset: number;
  items: Run[];
}
```

- [ ] **Step 4: Write `lib/api.ts`**

```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(err.detail ?? "Request failed"), { status: res.status });
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

import type { Job, RunPage } from "./types";

export const api = {
  listJobs: () => req<Job[]>("/jobs"),
  getJob: (id: string) => req<Job>(`/jobs/${id}`),
  createJob: (body: unknown) =>
    req<Job>("/jobs", { method: "POST", body: JSON.stringify(body) }),
  updateJob: (id: string, body: unknown) =>
    req<Job>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteJob: (id: string) => req<void>(`/jobs/${id}`, { method: "DELETE" }),
  toggleJob: (id: string) => req<Job>(`/jobs/${id}/toggle`, { method: "PATCH" }),
  triggerJob: (id: string) =>
    req<{ run_id: string }>(`/jobs/${id}/trigger`, { method: "POST" }),
  getRuns: (id: string, limit = 50, offset = 0) =>
    req<RunPage>(`/jobs/${id}/runs?limit=${limit}&offset=${offset}`),
};
```

- [ ] **Step 5: Verify dev server starts**

```bash
cd ~/Desktop/cronvault/frontend
npm run dev
```

Expected: Next.js on port 3000, no errors

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat: Next.js scaffold with types and API client"
```

---

## Task 10: Dashboard

**Files:**
- Create: `frontend/components/StatusBadge.tsx`
- Create: `frontend/components/JobTable.tsx`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Write `components/StatusBadge.tsx`**

```tsx
type Status = "success" | "failure" | "running" | null;

const styles: Record<NonNullable<Status>, string> = {
  success: "bg-green-100 text-green-800",
  failure: "bg-red-100 text-red-800",
  running: "bg-yellow-100 text-yellow-800",
};

export function StatusBadge({ status }: { status: Status }) {
  if (!status) return <span className="text-gray-400 text-xs">Never run</span>;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}
```

- [ ] **Step 2: Write `components/JobTable.tsx`**

```tsx
"use client";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { api } from "@/lib/api";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function JobTable({ jobs, onRefresh }: { jobs: Job[]; onRefresh: () => void }) {
  const router = useRouter();

  async function handleToggle(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    await api.toggleJob(id);
    onRefresh();
  }

  async function handleTrigger(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    try {
      await api.triggerJob(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
          <th className="py-3 pr-4">Name</th>
          <th className="py-3 pr-4">Type</th>
          <th className="py-3 pr-4">Schedule</th>
          <th className="py-3 pr-4">Next Run</th>
          <th className="py-3 pr-4">Last Run</th>
          <th className="py-3 pr-4">Streak</th>
          <th className="py-3" />
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr
            key={job.id}
            onClick={() => router.push(`/jobs/${job.id}`)}
            className="border-b hover:bg-gray-50 cursor-pointer"
          >
            <td className="py-3 pr-4 font-medium">{job.name}</td>
            <td className="py-3 pr-4">
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{job.type}</span>
            </td>
            <td className="py-3 pr-4 font-mono text-xs text-gray-500">{job.cron_expression}</td>
            <td className="py-3 pr-4 text-gray-500 text-xs">{formatDate(job.next_run_time)}</td>
            <td className="py-3 pr-4">
              <StatusBadge status={(job.last_run?.status ?? null) as any} />
            </td>
            <td className="py-3 pr-4 text-xs">
              {job.failure_streak > 0
                ? <span className="text-red-600 font-semibold">{job.failure_streak}✕ fail</span>
                : <span className="text-gray-300">—</span>}
            </td>
            <td className="py-3 flex gap-2">
              <button
                onClick={(e) => handleToggle(e, job.id)}
                className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
              >
                {job.enabled ? "Disable" : "Enable"}
              </button>
              <button
                onClick={(e) => handleTrigger(e, job.id)}
                className="text-xs px-2 py-1 rounded border hover:bg-gray-100"
              >
                Run now
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Write `app/page.tsx`**

```tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";
import { JobTable } from "@/components/JobTable";

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await api.listJobs();
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">CronVault</h1>
        <Link
          href="/jobs/new"
          className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800"
        >
          + New Job
        </Link>
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-400 text-sm">No jobs yet. Create one to get started.</p>
      ) : (
        <JobTable jobs={jobs} onRefresh={load} />
      )}
    </main>
  );
}
```

- [ ] **Step 4: Check dashboard renders at http://localhost:3000**

- [ ] **Step 5: Commit**

```bash
git add frontend/components/StatusBadge.tsx frontend/components/JobTable.tsx frontend/app/page.tsx
git commit -m "feat: dashboard with job table, toggle and run-now actions"
```

---

## Task 11: Job Form (Create + Edit)

**Files:**
- Create: `frontend/components/JobForm.tsx`
- Create: `frontend/app/jobs/new/page.tsx`
- Create: `frontend/app/jobs/[id]/edit/page.tsx`

- [ ] **Step 1: Write `components/JobForm.tsx`**

Note: the http timeout state setter is named `setHttpTimeoutSecs` to avoid shadowing `window.setTimeout`. cronstrue is used for human-readable cron preview.

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import cronstrue from "cronstrue";
import type { Job } from "@/lib/types";
import { api } from "@/lib/api";

function describeCron(expr: string): string {
  try {
    return cronstrue.toString(expr);
  } catch {
    return "Invalid cron expression";
  }
}

export function JobForm({ existing }: { existing?: Job }) {
  const router = useRouter();
  const httpCfg = existing?.config as any;
  const shellCfg = existing?.config as any;

  const [name, setName] = useState(existing?.name ?? "");
  const [type, setType] = useState<"http" | "shell">(existing?.type ?? "http");
  const [cron, setCron] = useState(existing?.cron_expression ?? "* * * * *");
  const [cronError, setCronError] = useState("");

  // HTTP fields
  const [url, setUrl] = useState(httpCfg?.url ?? "");
  const [method, setMethod] = useState(httpCfg?.method ?? "GET");
  const [expectedStatus, setExpectedStatus] = useState(httpCfg?.expected_status ?? 200);
  const [httpTimeoutSecs, setHttpTimeoutSecs] = useState(httpCfg?.timeout_seconds ?? 30);

  // Shell fields
  const [command, setCommand] = useState(shellCfg?.command ?? "");
  const [workingDir, setWorkingDir] = useState(shellCfg?.working_dir ?? "/");
  const [shellTimeoutSecs, setShellTimeoutSecs] = useState(shellCfg?.timeout_seconds ?? 30);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setCronError("");
    setSubmitting(true);

    const config = type === "http"
      ? { url, method, headers: {}, body: null, expected_status: expectedStatus, timeout_seconds: httpTimeoutSecs }
      : { command, working_dir: workingDir, timeout_seconds: shellTimeoutSecs };

    try {
      if (existing) {
        await api.updateJob(existing.id, { name, type, cron_expression: cron, config, enabled: existing.enabled });
        router.push(`/jobs/${existing.id}`);
      } else {
        const job = await api.createJob({ name, type, cron_expression: cron, config, enabled: true });
        router.push(`/jobs/${job.id}`);
      }
    } catch (err: any) {
      if (err.status === 422) setCronError("Invalid cron expression");
      else setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input className="w-full border rounded px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select className="w-full border rounded px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="http">HTTP</option>
          <option value="shell">Shell</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cron Expression</label>
        <input
          className="w-full border rounded px-3 py-2 text-sm font-mono"
          value={cron}
          onChange={(e) => { setCron(e.target.value); setCronError(""); }}
          required
        />
        <p className="text-xs text-gray-500 mt-1">{describeCron(cron)}</p>
        {cronError && <p className="text-xs text-red-500 mt-1">{cronError}</p>}
      </div>

      {type === "http" ? (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Method</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>
                {["GET","POST","PUT","PATCH","DELETE"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Expected Status</label>
              <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={expectedStatus} onChange={(e) => setExpectedStatus(Number(e.target.value))} />
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium mb-1">Timeout (s)</label>
              <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={httpTimeoutSecs} onChange={(e) => setHttpTimeoutSecs(Number(e.target.value))} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Command</label>
            <input className="w-full border rounded px-3 py-2 text-sm font-mono" value={command} onChange={(e) => setCommand(e.target.value)} required />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Working Directory</label>
              <input className="w-full border rounded px-3 py-2 text-sm font-mono" value={workingDir} onChange={(e) => setWorkingDir(e.target.value)} />
            </div>
            <div className="w-28">
              <label className="block text-sm font-medium mb-1">Timeout (s)</label>
              <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={shellTimeoutSecs} onChange={(e) => setShellTimeoutSecs(Number(e.target.value))} />
            </div>
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={submitting} className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50">
        {submitting ? "Saving..." : existing ? "Save Changes" : "Create Job"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Write `app/jobs/new/page.tsx`**

```tsx
import { JobForm } from "@/components/JobForm";
import Link from "next/link";

export default function NewJobPage() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <Link href="/" className="text-sm text-gray-500 hover:underline mb-6 block">← Back</Link>
      <h1 className="text-2xl font-bold mb-6">New Job</h1>
      <JobForm />
    </main>
  );
}
```

- [ ] **Step 3: Write `app/jobs/[id]/edit/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";
import { JobForm } from "@/components/JobForm";

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => { api.getJob(id).then(setJob); }, [id]);

  if (!job) return <p className="p-8 text-gray-400 text-sm">Loading...</p>;

  return (
    <main className="max-w-2xl mx-auto p-8">
      <Link href={`/jobs/${id}`} className="text-sm text-gray-500 hover:underline mb-6 block">← Back</Link>
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
      <JobForm existing={job} />
    </main>
  );
}
```

- [ ] **Step 4: Test create flow manually**

Open http://localhost:3000, click "+ New Job", create a shell job `echo hello` with `* * * * *`. Confirm redirect to job detail.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/JobForm.tsx frontend/app/jobs/
git commit -m "feat: job create and edit form with cronstrue preview"
```

---

## Task 12: Job Detail

**Files:**
- Create: `frontend/components/RunHistoryTable.tsx`
- Create: `frontend/components/DurationChart.tsx`
- Create: `frontend/app/jobs/[id]/page.tsx`

- [ ] **Step 1: Write `components/RunHistoryTable.tsx`**

```tsx
import type { Run } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function RunHistoryTable({ runs }: { runs: Run[] }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
          <th className="py-2 pr-4">Started</th>
          <th className="py-2 pr-4">Duration</th>
          <th className="py-2 pr-4">Status</th>
          <th className="py-2">Output</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((run) => (
          <tr key={run.id} className="border-b align-top">
            <td className="py-2 pr-4 text-xs text-gray-500 whitespace-nowrap">
              {new Date(run.started_at).toLocaleString()}
            </td>
            <td className="py-2 pr-4 text-xs">
              {run.duration_ms != null ? `${run.duration_ms}ms` : "—"}
            </td>
            <td className="py-2 pr-4">
              <StatusBadge status={run.status as any} />
            </td>
            <td className="py-2 text-xs font-mono text-gray-500 max-w-xs truncate">
              {run.output ?? "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Write `components/DurationChart.tsx`**

```tsx
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Run } from "@/lib/types";

export function DurationChart({ runs }: { runs: Run[] }) {
  const data = [...runs]
    .reverse()
    .filter((r) => r.duration_ms != null)
    .map((r) => ({
      time: new Date(r.started_at).toLocaleDateString(),
      ms: r.duration_ms,
    }));

  if (data.length < 2) return null;

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} unit="ms" width={48} />
        <Tooltip formatter={(v: number) => [`${v}ms`, "Duration"]} />
        <Line type="monotone" dataKey="ms" stroke="#111827" dot={false} strokeWidth={1.5} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 3: Write `app/jobs/[id]/page.tsx`**

```tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Job, Run } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { RunHistoryTable } from "@/components/RunHistoryTable";
import { DurationChart } from "@/components/DurationChart";

const LIMIT = 20;

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const load = useCallback(async () => {
    const [j, page] = await Promise.all([api.getJob(id), api.getRuns(id, LIMIT, offset)]);
    setJob(j);
    setRuns(page.items);
    setTotal(page.total);
  }, [id, offset]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!confirm(`Delete "${job?.name}" and all its run history?`)) return;
    await api.deleteJob(id);
    router.push("/");
  }

  if (!job) return <p className="p-8 text-gray-400 text-sm">Loading...</p>;

  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-sm text-gray-500 hover:underline mb-6 block">← All Jobs</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{job.name}</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{job.cron_expression}</span>
            <StatusBadge status={(job.last_run?.status ?? null) as any} />
            {job.failure_streak > 0 && (
              <span className="text-red-500 text-xs">{job.failure_streak} consecutive failures</span>
            )}
          </p>
          {job.next_run_time && (
            <p className="text-xs text-gray-400 mt-1">
              Next run: {new Date(job.next_run_time).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/jobs/${id}/edit`} className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50">Edit</Link>
          <button onClick={handleDelete} className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50">Delete</button>
        </div>
      </div>

      {runs.length >= 2 && (
        <div className="mb-8">
          <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Duration over time</p>
          <DurationChart runs={runs} />
        </div>
      )}

      <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Run History</p>
      {runs.length === 0 ? (
        <p className="text-gray-400 text-sm">No runs yet.</p>
      ) : (
        <>
          <RunHistoryTable runs={runs} />
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - LIMIT))} className="disabled:opacity-30 hover:text-black">← Prev</button>
            <span className="text-xs">{offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</span>
            <button disabled={offset + LIMIT >= total} onClick={() => setOffset(offset + LIMIT)} className="disabled:opacity-30 hover:text-black">Next →</button>
          </div>
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/components/RunHistoryTable.tsx frontend/components/DurationChart.tsx frontend/app/jobs/
git commit -m "feat: job detail with run history table and duration chart"
```

---

## Task 13: End-to-End Smoke Test + Portfolio Entry

- [ ] **Step 1: Full stack smoke test**

```bash
cd ~/Desktop/cronvault
docker compose up --build
```

Expected: backend healthy on :8000, frontend on :3000.

- [ ] **Step 2: Manual flow verification**

1. Open http://localhost:3000 → "No jobs yet"
2. Create a shell job: name "Smoke test", command `echo "CronVault works"`, cron `* * * * *`
3. Click "Run now" — success badge appears after a moment
4. Click the job row → run history shows one success run with output `CronVault works`
5. Disable the job — next_run_time shows "—"
6. Create an HTTP job pointing at a bad URL → confirm failure badge
7. Delete both jobs — dashboard empty

- [ ] **Step 3: Add to portfolio `content.json`**

File: `~/Desktop/prof_portfolio/refined-code-portfolio/src/data/content.json`

Confirm `src/lib/projectImages.ts` exists and follows the pattern in that file before adding the image. Then add to `portfolio.projects`:

```json
{
  "id": "cronvault",
  "title": "CronVault",
  "status": "past",
  "summary": "Self-hosted cron job manager with a web dashboard. Schedule HTTP and shell jobs on any cron expression, monitor run history and failure streaks at a glance, and trigger jobs manually — all running on localhost via Docker Compose.",
  "description": "CronVault fills the gap for developers who want cron visibility without subscribing to an external monitoring service. Jobs are HTTP endpoint pings or shell commands scheduled via cron expressions. APScheduler executes them in the background and records every run's status, output, and duration in SQLite. The dashboard shows next run time, last run status, and consecutive failure count per job. An in-memory APScheduler instance syncs from SQLite on every startup — the database is the only source of truth. A nightly cleanup job enforces 30-day run retention automatically.",
  "techStack": ["FastAPI", "APScheduler", "SQLite", "Next.js", "Recharts", "Docker Compose", "Python"],
  "features": [
    "HTTP and shell job types with full cron schedule configuration",
    "Live dashboard with last run status, consecutive failure streak, and next run time",
    "Manual trigger with concurrent run guard — returns 409 if a run is already in progress",
    "Paginated run history with a duration line chart per job",
    "30-day automatic run retention enforced by a nightly cleanup job",
    "Single SQLite file — zero external dependencies beyond Docker"
  ],
  "challenges": [
    "Keeping APScheduler's in-memory state consistent with the SQLite source of truth across restarts",
    "Computing failure streak without a dedicated counter column — walked recent runs on read",
    "Designing the concurrent run guard to apply uniformly for both scheduled and manual triggers"
  ],
  "github": "https://github.com/TretiqHiks/cronvault",
  "image": "project-cronvault"
}
```

- [ ] **Step 4: Generate and register the portfolio card image**

Generate a card image (dark dashboard with job rows, green/red status badges) and save to `src/assets/project-cronvault.jpg`. Then add to `src/lib/projectImages.ts`:

```typescript
import projectCronvault from "@/assets/project-cronvault.jpg";
// in imageMap:
"project-cronvault": projectCronvault,
```

- [ ] **Step 5: Final commit**

```bash
cd ~/Desktop/cronvault && git add . && git commit -m "feat: complete — smoke tested and ready for portfolio"
cd ~/Desktop/prof_portfolio/refined-code-portfolio && git add src/data/content.json src/lib/projectImages.ts src/assets/project-cronvault.jpg && git commit -m "feat: add CronVault to portfolio"
```
