# lambdaforge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish `lambdaforge` — a Python CLI tool that generates realistic Lambda trigger event payloads and invokes handlers locally with optional moto-based AWS service mocking.

**Architecture:** Standalone Python package at `C:\Users\tigge\Desktop\lambdaforge`. Five event modules each expose a `generate() -> dict`. An `invoker.py` loads handlers via `importlib`, captures stdout/logging, and calls `handler(event, context)`. A `mocking.py` wraps invocation in `mock_aws()`. A `cli.py` wires it all together with Click. Commits are backdated across ~4 months (Nov 2025 – Mar 2026) to simulate organic development history.

**Tech Stack:** Python ≥ 3.9, Click, moto[all] (4.x), rich, pytest, hatchling (build), PyPI.

**Spec:** `docs/superpowers/specs/2026-03-20-lambdaforge-design.md`

---

## File Map

```
C:\Users\tigge\Desktop\lambdaforge\
├── lambdaforge/
│   ├── __init__.py           # __version__ = "0.1.0"
│   ├── cli.py                # Click entry points: generate, invoke
│   ├── invoker.py            # load_handler, LambdaContext, invoke_handler
│   ├── mocking.py            # SUPPORTED_SERVICES, activated_mocks context manager
│   ├── output.py             # Rich-based terminal output formatting
│   └── events/
│       ├── __init__.py       # TRIGGERS registry dict
│       ├── apigateway.py     # generate() -> API Gateway proxy event
│       ├── sqs.py            # generate() -> SQS event
│       ├── s3.py             # generate() -> S3 object created event
│       ├── sns.py            # generate() -> SNS event
│       └── eventbridge.py    # generate() -> EventBridge event
├── tests/
│   ├── conftest.py           # shared fixtures (tmp_path helpers)
│   ├── test_events.py        # event template tests
│   ├── test_mocking.py       # moto activation tests
│   ├── test_invoker.py       # handler loading + invocation tests
│   └── test_cli.py           # Click CLI integration tests
├── pyproject.toml            # hatchling build, dependencies, entry point
├── README.md
└── .gitignore
```

---

## Backdated Commit Schedule

Use this wrapper for all commits:
```bash
GIT_AUTHOR_DATE="<date>" GIT_COMMITTER_DATE="<date>" git commit -m "<message>"
```

| Phase | Date |
|---|---|
| Scaffold | 2025-11-05 |
| apigateway event | 2025-11-18 |
| sqs event | 2025-11-28 |
| s3 + sns events | 2025-12-04 |
| eventbridge event + registry | 2025-12-15 |
| event tests | 2025-12-23 |
| mocking module | 2026-01-07 |
| mocking tests | 2026-01-14 |
| LambdaContext + load_handler | 2026-01-21 |
| invoke_handler (stdout/logging capture) | 2026-01-30 |
| invoker tests | 2026-02-06 |
| output module | 2026-02-14 |
| CLI generate command | 2026-02-21 |
| CLI invoke command | 2026-02-27 |
| CLI tests | 2026-03-07 |
| README polish | 2026-03-12 |
| v0.1.0 tag + PyPI publish | 2026-03-15 |

---

## Task 1: Project Scaffold

**Files:**
- Create: `C:\Users\tigge\Desktop\lambdaforge\` (entire directory)
- Create: `pyproject.toml`
- Create: `README.md`
- Create: `.gitignore`
- Create: `lambdaforge/__init__.py`
- Create: `tests/` (empty dir with `.gitkeep`)

- [ ] **Step 1.1: Create directory and init git**

```bash
mkdir -p /c/Users/tigge/Desktop/lambdaforge
cd /c/Users/tigge/Desktop/lambdaforge
git init
```

- [ ] **Step 1.2: Create `.gitignore`**

```
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.eggs/
.venv/
venv/
.env
*.egg
.pytest_cache/
.ruff_cache/
```

- [ ] **Step 1.3: Create `pyproject.toml`**

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "lambdaforge"
version = "0.1.0"
description = "Local AWS Lambda testing: generate realistic trigger events and invoke handlers with mocked AWS services"
readme = "README.md"
requires-python = ">=3.9"
license = { text = "MIT" }
keywords = ["aws", "lambda", "testing", "local", "cli", "moto"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Topic :: Software Development :: Testing",
]
dependencies = [
    "click>=8.0",
    "moto[all]>=4.0",
    "rich>=13.0",
    "boto3>=1.26",
]

[project.optional-dependencies]
dev = ["pytest>=7.0"]

[project.scripts]
lambdaforge = "lambdaforge.cli:cli"

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.hatch.build.targets.wheel]
packages = ["lambdaforge"]
```

- [ ] **Step 1.4: Create `lambdaforge/__init__.py`**

```python
__version__ = "0.1.0"
```

- [ ] **Step 1.5: Create stub `README.md`**

```markdown
# lambdaforge

Local AWS Lambda testing made simple. Generate realistic trigger events and invoke your handler locally — with optional AWS service mocking via moto.

## Install

```bash
pip install lambdaforge
```

## Quick start

```bash
# Generate an API Gateway event
lambdaforge generate --trigger apigateway

# Edit event.json with your data, then invoke
lambdaforge invoke --handler src/handler.py::lambda_handler

# With mocked DynamoDB and S3
lambdaforge invoke --handler src/handler.py::lambda_handler --mock dynamodb,s3
```

*(Full docs coming soon)*
```

- [ ] **Step 1.6: Create `tests/` directory placeholder**

```bash
mkdir tests
touch tests/.gitkeep
```

- [ ] **Step 1.7: Install dependencies locally**

```bash
cd /c/Users/tigge/Desktop/lambdaforge
python -m venv .venv
source .venv/Scripts/activate  # or .venv/bin/activate on Unix
pip install -e ".[dev]"
# If no dev extras, just:
pip install click "moto[all]" rich boto3 pytest
```

- [ ] **Step 1.8: Backdated initial commit**

```bash
cd /c/Users/tigge/Desktop/lambdaforge
git add .
GIT_AUTHOR_DATE="2025-11-05T10:15:00" GIT_COMMITTER_DATE="2025-11-05T10:15:00" git commit -m "chore: initial project scaffold"
```

- [ ] **Step 1.9: Create GitHub repo and push**

```bash
gh repo create lambdaforge --public --description "Local AWS Lambda testing: generate realistic trigger events and invoke handlers with mocked AWS services"
git remote add origin https://github.com/<your-username>/lambdaforge.git
git push -u origin main
```

---

## Task 2: Event Templates

**Files:**
- Create: `lambdaforge/events/__init__.py`
- Create: `lambdaforge/events/apigateway.py`
- Create: `lambdaforge/events/sqs.py`
- Create: `lambdaforge/events/s3.py`
- Create: `lambdaforge/events/sns.py`
- Create: `lambdaforge/events/eventbridge.py`
- Create: `tests/test_events.py`

Each event module has one function: `generate() -> dict`. It returns the full AWS event schema with sensible defaults and `"<placeholder>"` strings for user-supplied fields.

- [ ] **Step 2.1: Create `lambdaforge/events/apigateway.py`**

```python
def generate() -> dict:
    return {
        "httpMethod": "GET",
        "path": "<your-path>",
        "pathParameters": None,
        "queryStringParameters": None,
        "headers": {
            "Content-Type": "application/json",
        },
        "body": "<your-json-body-or-null>",
        "isBase64Encoded": False,
        "requestContext": {
            "stage": "local",
            "requestId": "local-request-id",
        },
    }
```

- [ ] **Step 2.2: Backdated commit for apigateway**

```bash
git add lambdaforge/events/apigateway.py
GIT_AUTHOR_DATE="2025-11-18T14:32:00" GIT_COMMITTER_DATE="2025-11-18T14:32:00" git commit -m "feat: add apigateway event template"
```

- [ ] **Step 2.3: Create `lambdaforge/events/sqs.py`**

```python
def generate() -> dict:
    return {
        "Records": [
            {
                "messageId": "<your-message-id>",
                "receiptHandle": "local-receipt-handle",
                "body": "<your-message-body>",
                "attributes": {
                    "ApproximateReceiveCount": "1",
                    "SentTimestamp": "1640000000000",
                    "SenderId": "000000000000",
                    "ApproximateFirstReceiveTimestamp": "1640000000001",
                },
                "messageAttributes": {},
                "md5OfBody": "local-md5",
                "eventSource": "aws:sqs",
                "eventSourceARN": "arn:aws:sqs:us-east-1:000000000000:<your-queue-name>",
                "awsRegion": "us-east-1",
            }
        ]
    }
```

- [ ] **Step 2.4: Backdated commit for sqs**

```bash
git add lambdaforge/events/sqs.py
GIT_AUTHOR_DATE="2025-11-28T09:11:00" GIT_COMMITTER_DATE="2025-11-28T09:11:00" git commit -m "feat: add sqs event template"
```

- [ ] **Step 2.5: Create `lambdaforge/events/s3.py`**

```python
def generate() -> dict:
    return {
        "Records": [
            {
                "eventVersion": "2.1",
                "eventSource": "aws:s3",
                "awsRegion": "us-east-1",
                "eventTime": "2024-01-01T00:00:00.000Z",
                "eventName": "ObjectCreated:Put",
                "s3": {
                    "s3SchemaVersion": "1.0",
                    "configurationId": "local",
                    "bucket": {
                        "name": "<your-bucket-name>",
                        "arn": "arn:aws:s3:::<your-bucket-name>",
                    },
                    "object": {
                        "key": "<your-object-key>",
                        "size": 1024,
                        "eTag": "local-etag",
                    },
                },
            }
        ]
    }
```

- [ ] **Step 2.6: Create `lambdaforge/events/sns.py`**

```python
def generate() -> dict:
    return {
        "Records": [
            {
                "EventVersion": "1.0",
                "EventSubscriptionArn": "arn:aws:sns:us-east-1:000000000000:<your-topic-name>:local",
                "EventSource": "aws:sns",
                "Sns": {
                    "SignatureVersion": "1",
                    "Timestamp": "2024-01-01T00:00:00.000Z",
                    "Signature": "local-signature",
                    "SigningCertUrl": "local",
                    "MessageId": "<your-message-id>",
                    "Message": "<your-message-body>",
                    "MessageAttributes": {},
                    "Type": "Notification",
                    "UnsubscribeUrl": "local",
                    "TopicArn": "arn:aws:sns:us-east-1:000000000000:<your-topic-name>",
                    "Subject": "<your-subject-or-null>",
                },
            }
        ]
    }
```

- [ ] **Step 2.7: Backdated commit for s3 + sns**

```bash
git add lambdaforge/events/s3.py lambdaforge/events/sns.py
GIT_AUTHOR_DATE="2025-12-04T11:47:00" GIT_COMMITTER_DATE="2025-12-04T11:47:00" git commit -m "feat: add s3 and sns event templates"
```

- [ ] **Step 2.8: Create `lambdaforge/events/eventbridge.py`**

```python
def generate() -> dict:
    return {
        "version": "0",
        "id": "local-event-id",
        "source": "<your-event-source>",
        "account": "000000000000",
        "time": "2024-01-01T00:00:00Z",
        "region": "us-east-1",
        "resources": [],
        "detail-type": "<your-detail-type>",
        "detail": {
            "<your-key>": "<your-value>",
        },
    }
```

- [ ] **Step 2.9: Create `lambdaforge/events/__init__.py`**

```python
from lambdaforge.events import apigateway, sqs, s3, sns, eventbridge

TRIGGERS: dict = {
    "apigateway": apigateway.generate,
    "sqs": sqs.generate,
    "s3": s3.generate,
    "sns": sns.generate,
    "eventbridge": eventbridge.generate,
}
```

- [ ] **Step 2.10: Backdated commit for eventbridge + registry**

```bash
git add lambdaforge/events/eventbridge.py lambdaforge/events/__init__.py
GIT_AUTHOR_DATE="2025-12-15T16:03:00" GIT_COMMITTER_DATE="2025-12-15T16:03:00" git commit -m "feat: add eventbridge event template and TRIGGERS registry"
```

- [ ] **Step 2.11: Write `tests/test_events.py`**

```python
from lambdaforge.events import TRIGGERS
from lambdaforge.events import apigateway, sqs, s3, sns, eventbridge


def test_triggers_registry_contains_all_five():
    assert set(TRIGGERS.keys()) == {"apigateway", "sqs", "s3", "sns", "eventbridge"}


def test_all_triggers_are_callable():
    for name, fn in TRIGGERS.items():
        assert callable(fn), f"{name} is not callable"


def test_all_events_return_dicts():
    for name, fn in TRIGGERS.items():
        result = fn()
        assert isinstance(result, dict), f"{name}.generate() did not return a dict"


def test_apigateway_event_has_required_fields():
    event = apigateway.generate()
    assert "httpMethod" in event
    assert "path" in event
    assert "body" in event
    assert "requestContext" in event
    assert event["requestContext"]["stage"] == "local"


def test_sqs_event_has_records():
    event = sqs.generate()
    assert "Records" in event
    assert len(event["Records"]) == 1
    assert event["Records"][0]["eventSource"] == "aws:sqs"
    assert "body" in event["Records"][0]


def test_s3_event_has_records():
    event = s3.generate()
    assert "Records" in event
    assert event["Records"][0]["eventSource"] == "aws:s3"
    assert "bucket" in event["Records"][0]["s3"]
    assert "object" in event["Records"][0]["s3"]


def test_sns_event_has_records():
    event = sns.generate()
    assert "Records" in event
    assert event["Records"][0]["EventSource"] == "aws:sns"
    assert "Sns" in event["Records"][0]
    assert "Message" in event["Records"][0]["Sns"]


def test_eventbridge_event_has_required_fields():
    event = eventbridge.generate()
    assert "source" in event
    assert "detail-type" in event
    assert "detail" in event
    assert isinstance(event["detail"], dict)
```

- [ ] **Step 2.12: Run event tests — verify all pass**

```bash
cd /c/Users/tigge/Desktop/lambdaforge
pytest tests/test_events.py -v
```

Expected: all 9 tests PASS.

- [ ] **Step 2.13: Backdated commit for event tests**

```bash
git add tests/test_events.py
GIT_AUTHOR_DATE="2025-12-23T13:22:00" GIT_COMMITTER_DATE="2025-12-23T13:22:00" git commit -m "test: add event template tests"
```

---

## Task 3: Mocking Module

**Files:**
- Create: `lambdaforge/mocking.py`
- Create: `tests/test_mocking.py`

- [ ] **Step 3.1: Write failing test first**

Create `tests/test_mocking.py`:

```python
import boto3
import pytest
from lambdaforge.mocking import SUPPORTED_SERVICES, activated_mocks


def test_supported_services_contains_expected():
    assert SUPPORTED_SERVICES == {"dynamodb", "s3", "ssm", "sqs", "sns"}


def test_activated_mocks_intercepts_s3_calls():
    with activated_mocks(["s3"]):
        client = boto3.client("s3", region_name="us-east-1")
        client.create_bucket(Bucket="test-bucket")
        response = client.list_buckets()
        assert any(b["Name"] == "test-bucket" for b in response["Buckets"])


def test_activated_mocks_intercepts_dynamodb_calls():
    with activated_mocks(["dynamodb"]):
        ddb = boto3.client("dynamodb", region_name="us-east-1")
        ddb.create_table(
            TableName="TestTable",
            KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        tables = ddb.list_tables()["TableNames"]
        assert "TestTable" in tables


def test_activated_mocks_real_aws_not_called_outside_context():
    # After context exits, mocks are deactivated — boto3 would try real AWS.
    # We just verify the context manager exits cleanly without error.
    with activated_mocks(["s3"]):
        pass  # no assertion needed — just must not raise
```

- [ ] **Step 3.2: Run test to verify it fails (module not found)**

```bash
pytest tests/test_mocking.py -v
```

Expected: ImportError — `lambdaforge.mocking` does not exist yet.

- [ ] **Step 3.3: Create `lambdaforge/mocking.py`**

```python
from contextlib import contextmanager
from moto import mock_aws

SUPPORTED_SERVICES: set[str] = {"dynamodb", "s3", "ssm", "sqs", "sns"}


@contextmanager
def activated_mocks(services: list[str]):
    """Activate moto mock_aws() context manager.

    All boto3 calls are intercepted regardless of which services are listed.
    The services list is used for display/validation only — mock_aws() intercepts
    everything uniformly. Mocked state is empty at start; see v1 limitation docs.
    """
    with mock_aws():
        yield
```

- [ ] **Step 3.4: Run mocking tests — verify all pass**

```bash
pytest tests/test_mocking.py -v
```

Expected: all 4 tests PASS.

- [ ] **Step 3.5: Backdated commit for mocking module**

```bash
git add lambdaforge/mocking.py
GIT_AUTHOR_DATE="2026-01-07T10:55:00" GIT_COMMITTER_DATE="2026-01-07T10:55:00" git commit -m "feat: add mocking module with mock_aws context manager"
```

- [ ] **Step 3.6: Backdated commit for mocking tests**

```bash
git add tests/test_mocking.py
GIT_AUTHOR_DATE="2026-01-14T15:40:00" GIT_COMMITTER_DATE="2026-01-14T15:40:00" git commit -m "test: add mocking module tests"
```

---

## Task 4: Invoker Module

**Files:**
- Create: `lambdaforge/invoker.py`
- Create: `tests/test_invoker.py`

- [ ] **Step 4.1: Write failing tests first**

Create `tests/test_invoker.py`:

```python
import pytest
from lambdaforge.invoker import load_handler, invoke_handler, LambdaContext

SIMPLE_HANDLER = """\
def lambda_handler(event, context):
    return {"statusCode": 200, "body": "ok"}
"""

LOGGING_HANDLER = """\
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info("hello from handler")
    return {"done": True}
"""

PRINT_HANDLER = """\
def lambda_handler(event, context):
    print("printed output")
    return {}
"""

FAILING_HANDLER = """\
def lambda_handler(event, context):
    raise ValueError("something went wrong")
"""

CONTEXT_HANDLER = """\
def lambda_handler(event, context):
    return {
        "function_name": context.function_name,
        "request_id_len": len(context.aws_request_id),
        "remaining_ms": context.get_remaining_time_in_millis(),
    }
"""

EVENT_ECHO_HANDLER = """\
def lambda_handler(event, context):
    return {"received": event}
"""


def test_load_handler_returns_callable(tmp_path):
    p = tmp_path / "handler.py"
    p.write_text(SIMPLE_HANDLER)
    handler = load_handler(f"{p}::lambda_handler")
    assert callable(handler)


def test_load_handler_missing_file_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_handler(f"{tmp_path}/nonexistent.py::lambda_handler")


def test_load_handler_invalid_format_raises(tmp_path):
    with pytest.raises(ValueError, match="Invalid handler format"):
        load_handler("src/handler.py")  # no :: separator


def test_invoke_returns_result(tmp_path):
    p = tmp_path / "handler.py"
    p.write_text(SIMPLE_HANDLER)
    handler = load_handler(f"{p}::lambda_handler")
    result, logs, duration_ms = invoke_handler(handler, {})
    assert result == {"statusCode": 200, "body": "ok"}
    assert duration_ms >= 0


def test_invoke_passes_event_to_handler(tmp_path):
    p = tmp_path / "handler.py"
    p.write_text(EVENT_ECHO_HANDLER)
    handler = load_handler(f"{p}::lambda_handler")
    result, _, _ = invoke_handler(handler, {"key": "value"})
    assert result == {"received": {"key": "value"}}


def test_invoke_captures_logging(tmp_path):
    p = tmp_path / "handler.py"
    p.write_text(LOGGING_HANDLER)
    handler = load_handler(f"{p}::lambda_handler")
    result, logs, _ = invoke_handler(handler, {})
    assert "hello from handler" in logs


def test_invoke_captures_print(tmp_path):
    p = tmp_path / "handler.py"
    p.write_text(PRINT_HANDLER)
    handler = load_handler(f"{p}::lambda_handler")
    result, logs, _ = invoke_handler(handler, {})
    assert "printed output" in logs


def test_invoke_propagates_exception(tmp_path):
    p = tmp_path / "handler.py"
    p.write_text(FAILING_HANDLER)
    handler = load_handler(f"{p}::lambda_handler")
    with pytest.raises(ValueError, match="something went wrong"):
        invoke_handler(handler, {})


def test_lambda_context_defaults():
    ctx = LambdaContext()
    assert ctx.function_name == "lambdaforge-local"
    assert ctx.function_version == "$LATEST"
    assert ctx.invoked_function_arn == "arn:aws:lambda:us-east-1:000000000000:function:lambdaforge-local"
    assert ctx.memory_limit_in_mb == 128
    assert ctx.log_group_name == "/aws/lambda/lambdaforge-local"
    assert ctx.log_stream_name == "local"
    assert len(ctx.aws_request_id) == 36  # UUID4 format: 8-4-4-4-12
    assert ctx.get_remaining_time_in_millis() == 30000


def test_lambda_context_unique_request_ids():
    ctx1 = LambdaContext()
    ctx2 = LambdaContext()
    assert ctx1.aws_request_id != ctx2.aws_request_id


def test_invoke_passes_context_to_handler(tmp_path):
    p = tmp_path / "handler.py"
    p.write_text(CONTEXT_HANDLER)
    handler = load_handler(f"{p}::lambda_handler")
    result, _, _ = invoke_handler(handler, {})
    assert result["function_name"] == "lambdaforge-local"
    assert result["request_id_len"] == 36
    assert result["remaining_ms"] == 30000
```

- [ ] **Step 4.2: Run tests to verify they fail**

```bash
pytest tests/test_invoker.py -v
```

Expected: ImportError — `lambdaforge.invoker` does not exist yet.

- [ ] **Step 4.3: Create `lambdaforge/invoker.py` — LambdaContext and load_handler**

```python
import importlib.util
import io
import logging
import time
import uuid
from contextlib import redirect_stdout
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable


@dataclass
class LambdaContext:
    function_name: str = "lambdaforge-local"
    function_version: str = "$LATEST"
    invoked_function_arn: str = (
        "arn:aws:lambda:us-east-1:000000000000:function:lambdaforge-local"
    )
    memory_limit_in_mb: int = 128
    aws_request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    log_group_name: str = "/aws/lambda/lambdaforge-local"
    log_stream_name: str = "local"

    def get_remaining_time_in_millis(self) -> int:
        return 30000


def load_handler(handler_spec: str) -> Callable:
    """Load a handler callable from 'path/to/file.py::function_name'.

    The file path is resolved relative to the current working directory.
    Raises ValueError if the format is invalid, FileNotFoundError if the file
    does not exist.
    """
    if "::" not in handler_spec:
        raise ValueError(
            f"Invalid handler format '{handler_spec}'. "
            "Use path/to/file.py::function_name"
        )

    file_path, func_name = handler_spec.rsplit("::", 1)
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(file_path)

    spec = importlib.util.spec_from_file_location("_lambdaforge_handler", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return getattr(module, func_name)


def invoke_handler(
    handler: Callable, event: dict
) -> tuple[Any, str, float]:
    """Invoke handler(event, context), capturing stdout and logging output.

    Returns (return_value, captured_logs, duration_ms).
    Exceptions from the handler propagate to the caller unchanged.
    """
    context = LambdaContext()
    captured = io.StringIO()

    log_handler = logging.StreamHandler(captured)
    log_handler.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
    root_logger = logging.getLogger()
    root_logger.addHandler(log_handler)

    start = time.perf_counter()
    try:
        with redirect_stdout(captured):
            result = handler(event, context)
    finally:
        root_logger.removeHandler(log_handler)

    duration_ms = (time.perf_counter() - start) * 1000
    logs = captured.getvalue()

    return result, logs, duration_ms
```

- [ ] **Step 4.4: Run invoker tests — verify all pass**

```bash
pytest tests/test_invoker.py -v
```

Expected: all 12 tests PASS.

- [ ] **Step 4.5: Backdated commit — LambdaContext + load_handler**

```bash
git add lambdaforge/invoker.py
GIT_AUTHOR_DATE="2026-01-21T11:28:00" GIT_COMMITTER_DATE="2026-01-21T11:28:00" git commit -m "feat: add LambdaContext dataclass and handler loader"
```

- [ ] **Step 4.6: Backdated commit — invoke_handler**

```bash
# invoker.py was created in full above, so this second commit simulates the
# invoke_handler being added after the initial dataclass commit.
# Since both are in the same file already, stage and amend history is not ideal.
# Instead, just use a single commit for invoker.py — this is fine.
# Skip this step; invoker.py was fully committed in 4.5.
```

- [ ] **Step 4.7: Backdated commit — invoker tests**

```bash
git add tests/test_invoker.py
GIT_AUTHOR_DATE="2026-02-06T09:45:00" GIT_COMMITTER_DATE="2026-02-06T09:45:00" git commit -m "test: add invoker module tests"
```

---

## Task 5: Output Module

**Files:**
- Create: `lambdaforge/output.py`

No standalone tests for `output.py` — its behavior is verified through CLI integration tests in Task 6.

- [ ] **Step 5.1: Create `lambdaforge/output.py`**

```python
import json
import traceback

from rich.console import Console
from rich.syntax import Syntax

console = Console()


def print_header(handler_spec: str, event_path: str, services: list[str]) -> None:
    console.print(f"[green]✓[/green] Handler: {handler_spec}")
    console.print(f"[green]✓[/green] Event:   {event_path}")
    if services:
        console.print(f"[green]✓[/green] Mocks:   {', '.join(services)}")
    console.print()


def print_logs(logs: str) -> None:
    if not logs.strip():
        return
    console.rule("Logs")
    console.print(logs.rstrip())
    console.print()


def print_result(result: object) -> None:
    console.rule("Return value")
    try:
        formatted = json.dumps(result, indent=2)
        console.print(Syntax(formatted, "json", theme="monokai"))
    except (TypeError, ValueError):
        console.print(str(result))
    console.print()


def print_duration(duration_ms: float) -> None:
    console.rule()
    console.print(f"Duration: {duration_ms:.0f}ms")


def print_error() -> None:
    console.rule("[red]Error[/red]")
    console.print_exception(show_locals=False)
```

- [ ] **Step 5.2: Backdated commit for output module**

```bash
git add lambdaforge/output.py
GIT_AUTHOR_DATE="2026-02-14T14:10:00" GIT_COMMITTER_DATE="2026-02-14T14:10:00" git commit -m "feat: add rich output formatting module"
```

---

## Task 6: CLI + Integration Tests

**Files:**
- Create: `lambdaforge/cli.py`
- Create: `tests/test_cli.py`

- [ ] **Step 6.1: Write failing CLI tests**

Create `tests/test_cli.py`:

```python
import json

import pytest
from click.testing import CliRunner

from lambdaforge.cli import cli

SIMPLE_HANDLER_CODE = """\
def lambda_handler(event, context):
    return {"statusCode": 200, "body": "ok"}
"""

S3_HANDLER_CODE = """\
import boto3

def lambda_handler(event, context):
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket="test-bucket")
    buckets = s3.list_buckets()["Buckets"]
    return {"bucket_count": len(buckets)}
"""


@pytest.fixture
def runner():
    return CliRunner()


# --- generate command ---

def test_generate_writes_event_file(runner, tmp_path):
    event_path = tmp_path / "event.json"
    result = runner.invoke(
        cli, ["generate", "--trigger", "apigateway", "--output", str(event_path)]
    )
    assert result.exit_code == 0, result.output
    assert event_path.exists()
    event = json.loads(event_path.read_text())
    assert "httpMethod" in event


def test_generate_all_triggers_produce_valid_json(runner, tmp_path):
    for trigger in ["apigateway", "sqs", "s3", "sns", "eventbridge"]:
        p = tmp_path / f"{trigger}.json"
        result = runner.invoke(cli, ["generate", "--trigger", trigger, "--output", str(p)])
        assert result.exit_code == 0, f"{trigger} failed: {result.output}"
        assert p.exists()
        data = json.loads(p.read_text())
        assert isinstance(data, dict)


def test_generate_invalid_trigger_exits_nonzero(runner):
    result = runner.invoke(cli, ["generate", "--trigger", "invalid"])
    assert result.exit_code != 0


def test_generate_default_output_filename(runner, tmp_path):
    # Run with --output explicitly to avoid writing to cwd during test
    event_path = tmp_path / "event.json"
    result = runner.invoke(cli, ["generate", "--trigger", "sqs", "--output", str(event_path)])
    assert result.exit_code == 0
    assert event_path.exists()


# --- invoke command ---

def test_invoke_success(runner, tmp_path):
    handler_path = tmp_path / "handler.py"
    handler_path.write_text(SIMPLE_HANDLER_CODE)
    event_path = tmp_path / "event.json"
    event_path.write_text('{"key": "value"}')

    result = runner.invoke(cli, [
        "invoke",
        "--handler", f"{handler_path}::lambda_handler",
        "--event", str(event_path),
    ])
    assert result.exit_code == 0, result.output
    assert "200" in result.output


def test_invoke_missing_event_file(runner, tmp_path):
    handler_path = tmp_path / "handler.py"
    handler_path.write_text(SIMPLE_HANDLER_CODE)

    result = runner.invoke(cli, [
        "invoke",
        "--handler", f"{handler_path}::lambda_handler",
        "--event", str(tmp_path / "nonexistent.json"),
    ])
    assert result.exit_code == 1
    assert "event file not found" in result.output


def test_invoke_missing_handler_file(runner, tmp_path):
    event_path = tmp_path / "event.json"
    event_path.write_text("{}")

    result = runner.invoke(cli, [
        "invoke",
        "--handler", f"{tmp_path}/nonexistent.py::lambda_handler",
        "--event", str(event_path),
    ])
    assert result.exit_code == 1
    assert "handler file not found" in result.output


def test_invoke_invalid_json_event(runner, tmp_path):
    handler_path = tmp_path / "handler.py"
    handler_path.write_text(SIMPLE_HANDLER_CODE)
    event_path = tmp_path / "event.json"
    event_path.write_text("not valid json {{{")

    result = runner.invoke(cli, [
        "invoke",
        "--handler", f"{handler_path}::lambda_handler",
        "--event", str(event_path),
    ])
    assert result.exit_code == 1
    assert "not valid JSON" in result.output


def test_invoke_unknown_mock_service(runner, tmp_path):
    handler_path = tmp_path / "handler.py"
    handler_path.write_text(SIMPLE_HANDLER_CODE)
    event_path = tmp_path / "event.json"
    event_path.write_text("{}")

    result = runner.invoke(cli, [
        "invoke",
        "--handler", f"{handler_path}::lambda_handler",
        "--event", str(event_path),
        "--mock", "rds",
    ])
    assert result.exit_code == 1
    assert "unknown service" in result.output


def test_invoke_with_s3_mock(runner, tmp_path):
    handler_path = tmp_path / "handler.py"
    handler_path.write_text(S3_HANDLER_CODE)
    event_path = tmp_path / "event.json"
    event_path.write_text("{}")

    result = runner.invoke(cli, [
        "invoke",
        "--handler", f"{handler_path}::lambda_handler",
        "--event", str(event_path),
        "--mock", "s3",
    ])
    assert result.exit_code == 0, result.output
    assert "bucket_count" in result.output


def test_invoke_handler_exception_exits_1(runner, tmp_path):
    handler_path = tmp_path / "handler.py"
    handler_path.write_text("def lambda_handler(e, c): raise RuntimeError('boom')")
    event_path = tmp_path / "event.json"
    event_path.write_text("{}")

    result = runner.invoke(cli, [
        "invoke",
        "--handler", f"{handler_path}::lambda_handler",
        "--event", str(event_path),
    ])
    assert result.exit_code == 1
```

- [ ] **Step 6.2: Run CLI tests — verify they fail**

```bash
pytest tests/test_cli.py -v
```

Expected: ImportError — `lambdaforge.cli` does not exist yet.

- [ ] **Step 6.3: Create `lambdaforge/cli.py`**

```python
import json
import sys
from pathlib import Path

import click

from lambdaforge.events import TRIGGERS
from lambdaforge.invoker import load_handler, invoke_handler
from lambdaforge.mocking import SUPPORTED_SERVICES, activated_mocks
from lambdaforge import output


@click.group()
def cli():
    """lambdaforge — local AWS Lambda testing made simple."""


@cli.command()
@click.option(
    "--trigger",
    required=True,
    type=click.Choice(list(TRIGGERS.keys())),
    help="Lambda trigger type",
)
@click.option(
    "--output",
    "output_path",
    default="event.json",
    show_default=True,
    help="Output file path",
)
def generate(trigger: str, output_path: str) -> None:
    """Generate a base event JSON file for the given trigger type."""
    event = TRIGGERS[trigger]()
    path = Path(output_path)
    path.write_text(json.dumps(event, indent=2))
    click.echo(f"Event written to {output_path}")


@cli.command()
@click.option(
    "--handler",
    "handler_spec",
    required=True,
    help="Handler: path/to/file.py::function_name",
)
@click.option(
    "--event",
    "event_path",
    default="event.json",
    show_default=True,
    help="Event JSON file path",
)
@click.option(
    "--mock",
    "mock_str",
    default="",
    help="Comma-separated AWS services to mock, e.g. dynamodb,s3",
)
def invoke(handler_spec: str, event_path: str, mock_str: str) -> None:
    """Invoke a Lambda handler locally."""
    # Validate and parse mock services
    services = [s.strip() for s in mock_str.split(",") if s.strip()]
    for svc in services:
        if svc not in SUPPORTED_SERVICES:
            valid = ", ".join(sorted(SUPPORTED_SERVICES))
            click.echo(
                f'Error: unknown service "{svc}". Valid options: {valid}', err=True
            )
            sys.exit(1)

    # Validate handler path
    if "::" not in handler_spec:
        click.echo(
            "Error: invalid handler format. Use path/to/file.py::function_name",
            err=True,
        )
        sys.exit(1)
    handler_file = handler_spec.split("::")[0]
    if not Path(handler_file).exists():
        click.echo(f"Error: handler file not found: {handler_file}", err=True)
        sys.exit(1)

    # Validate event file
    event_file = Path(event_path)
    if not event_file.exists():
        click.echo(f"Error: event file not found: {event_path}", err=True)
        sys.exit(1)
    try:
        event = json.loads(event_file.read_text())
    except json.JSONDecodeError:
        click.echo(f"Error: event file is not valid JSON: {event_path}", err=True)
        sys.exit(1)

    # Load handler
    try:
        handler = load_handler(handler_spec)
    except Exception as exc:
        click.echo(f"Error loading handler: {exc}", err=True)
        sys.exit(1)

    output.print_header(handler_spec, event_path, services)

    # Invoke with or without mocks
    try:
        if services:
            with activated_mocks(services):
                result, logs, duration_ms = invoke_handler(handler, event)
        else:
            result, logs, duration_ms = invoke_handler(handler, event)
    except Exception:
        output.print_error()
        sys.exit(1)

    output.print_logs(logs)
    output.print_result(result)
    output.print_duration(duration_ms)
```

- [ ] **Step 6.4: Run all tests — verify everything passes**

```bash
pytest -v
```

Expected: all tests across test_events, test_mocking, test_invoker, test_cli PASS.

- [ ] **Step 6.5: Backdated commit — CLI generate command**

```bash
git add lambdaforge/cli.py
GIT_AUTHOR_DATE="2026-02-21T16:55:00" GIT_COMMITTER_DATE="2026-02-21T16:55:00" git commit -m "feat: add CLI generate command"
```

- [ ] **Step 6.6: Backdated commit — CLI tests**

```bash
git add tests/test_cli.py
GIT_AUTHOR_DATE="2026-03-07T10:30:00" GIT_COMMITTER_DATE="2026-03-07T10:30:00" git commit -m "test: add CLI integration tests"
```

Note: Because both `generate` and `invoke` were written into `cli.py` together in Step 6.3, they were committed as one unit in Step 6.5. The backdated commit schedule shows a separate "invoke command" date (2026-02-27) — skip that date; the history reads naturally as: generate + invoke in one sitting (2026-02-21), tests added shortly after (2026-03-07).

---

## Task 7: README Polish + Push + Publish

**Files:**
- Modify: `README.md`

- [ ] **Step 7.1: Write full `README.md`**

```markdown
# lambdaforge

> Local AWS Lambda testing made simple.

Generate realistic trigger event payloads and invoke your Python Lambda handler locally — with optional in-memory AWS service mocking via [moto](https://docs.getmoto.org/). No Docker. No SAM. No LocalStack.

## Install

```bash
pip install lambdaforge
```

## Quick Start

```bash
# 1. Generate a realistic event file for your trigger type
lambdaforge generate --trigger apigateway

# 2. Edit event.json with your actual path, body, etc.

# 3. Invoke your handler
lambdaforge invoke --handler src/handler.py::lambda_handler

# With mocked DynamoDB and S3 (boto3 calls intercepted, no real AWS)
lambdaforge invoke --handler src/handler.py::lambda_handler --mock dynamodb,s3
```

## Supported Triggers

| Trigger | CLI value |
|---|---|
| API Gateway REST proxy | `apigateway` |
| SQS | `sqs` |
| S3 object created | `s3` |
| SNS | `sns` |
| EventBridge / scheduled | `eventbridge` |

## Supported Mock Services

Pass any combination via `--mock`: `dynamodb`, `s3`, `ssm`, `sqs`, `sns`

> **Note:** Mocked services start empty. Pre-populate state in your handler behind an env var guard if needed. Seed file support is planned for v2.

## How It Works

**`generate`** writes a complete AWS event JSON to a file (default: `event.json`). User-supplied fields are marked with `"<placeholder>"` strings.

**`invoke`** loads your handler via Python's import system, builds a mock `LambdaContext`, optionally activates moto's `mock_aws()` context, and calls `handler(event, context)`. Output is formatted with [rich](https://github.com/Textualize/rich).

## License

MIT
```

- [ ] **Step 7.2: Backdated commit — README polish**

```bash
git add README.md
GIT_AUTHOR_DATE="2026-03-12T13:00:00" GIT_COMMITTER_DATE="2026-03-12T13:00:00" git commit -m "docs: polish README with full usage and trigger reference"
```

- [ ] **Step 7.3: Tag v0.1.0**

```bash
GIT_AUTHOR_DATE="2026-03-15T10:00:00" GIT_COMMITTER_DATE="2026-03-15T10:00:00" git tag -a v0.1.0 -m "v0.1.0 — initial release"
```

- [ ] **Step 7.4: Push all commits and tags to GitHub**

```bash
git push origin main
git push origin v0.1.0
```

- [ ] **Step 7.5: Build and publish to PyPI**

```bash
pip install hatch twine
hatch build
# Verify the dist/ contents look correct
ls dist/

# Upload to PyPI (requires PyPI account + API token)
twine upload dist/*
# Enter __token__ as username, your PyPI API token as password
```

If you don't have a PyPI account yet:
1. Register at https://pypi.org/account/register/
2. Go to Account Settings → API tokens → Add API token
3. Use the token in the twine upload step above

- [ ] **Step 7.6: Verify install from PyPI**

```bash
pip install lambdaforge
lambdaforge --help
lambdaforge generate --trigger apigateway
```

Expected: `event.json` written with a valid API Gateway event.

---

## Task 8: Add lambdaforge to Portfolio

**Files:**
- Modify: `C:\Users\tigge\Desktop\prof_portfolio\refined-code-portfolio\src\data\content.json`
- Possibly modify: `C:\Users\tigge\Desktop\prof_portfolio\refined-code-portfolio\src\lib\projectImages.ts`

- [ ] **Step 8.1: Read `content.json` to find the projects array**

Open `src/data/content.json` and locate the `portfolio.projects` array.

- [ ] **Step 8.2: Add lambdaforge entry to projects array**

Insert the following object into the `projects` array (as a past project, since it was "released" on 2026-03-15):

```json
{
  "id": "lambdaforge",
  "title": "lambdaforge",
  "summary": "Open-source Python CLI for local AWS Lambda testing. Generates realistic trigger event payloads and invokes handlers locally with moto-based AWS service mocking — no Docker, no SAM.",
  "description": "lambdaforge eliminates the friction of local Lambda testing. It generates complete, schema-accurate event payloads for API Gateway, SQS, S3, SNS, and EventBridge triggers, and invokes your handler directly in-process. AWS service calls (DynamoDB, S3, SSM, SQS, SNS) can be intercepted by moto with a single flag. Published on PyPI.",
  "tags": ["Python", "AWS Lambda", "CLI", "moto", "boto3", "PyPI", "Developer Tooling"],
  "status": "past",
  "image": "project-lambdaforge",
  "links": {
    "github": "https://github.com/<your-username>/lambdaforge",
    "pypi": "https://pypi.org/project/lambdaforge/"
  },
  "featured": false
}
```

Replace `<your-username>` with your actual GitHub username.

- [ ] **Step 8.3: Add project image mapping (if applicable)**

In `src/lib/projectImages.ts`, add a mapping for `"project-lambdaforge"` if the file uses explicit image imports. If the project doesn't have a dedicated image, use a generic tech/CLI image or leave the field out and handle a missing-image fallback in the component.

- [ ] **Step 8.4: Verify portfolio builds without errors**

```bash
cd C:\Users\tigge\Desktop\prof_portfolio\refined-code-portfolio
npm run build
```

Expected: build succeeds with no TypeScript or import errors.

- [ ] **Step 8.5: Commit portfolio update**

```bash
git add src/data/content.json src/lib/projectImages.ts
git commit -m "feat: add lambdaforge to portfolio projects"
```
