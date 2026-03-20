# lambdaforge — Design Spec

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

`lambdaforge` is a Python CLI tool that makes local Lambda testing fast and frictionless. It solves two common pain points: generating realistic mock trigger event payloads, and optionally activating lightweight AWS service mocks so the handler can run without hitting real AWS.

Install via PyPI:

```
pip install lambdaforge
```

---

## Problem Statement

Testing AWS Lambda functions locally is unnecessarily painful. The dominant solutions (SAM, LocalStack) are heavy, require Docker, and have steep setup curves for what is often a simple need: "I just want to run my handler with a realistic event and see if it works."

The two biggest friction points are:
1. **Event payloads** — manually writing a valid API Gateway, SQS, or S3 event JSON is tedious and error-prone. The schemas are large and vary per trigger type.
2. **AWS service calls** — if the handler calls DynamoDB or S3, those calls need to go somewhere that isn't real AWS during local development.

`lambdaforge` addresses both with a lightweight, zero-Docker solution.

---

## Commands

### `lambdaforge generate`

Generates a realistic base event JSON file for the specified trigger type.

```
lambdaforge generate --trigger <type> [--output event.json]
```

- `--trigger` — one of: `apigateway`, `sqs`, `s3`, `sns`, `eventbridge`
- `--output` — file path to write the event JSON (default: `event.json`)

The generated file uses the real AWS event schema with sensible defaults. Fields the user is expected to fill in are marked with `"<placeholder>"` strings so they are immediately visible. The user edits the file with their actual data, then passes it to `invoke`.

The default output path (`event.json`) and the default `--event` path in `invoke` are intentionally the same. The intended default workflow is: run `generate` to produce `event.json`, edit it, then run `invoke` without specifying `--event` to pick it up automatically.

**Example output (`apigateway`):**

```json
{
  "httpMethod": "GET",
  "path": "<your-path>",
  "pathParameters": null,
  "queryStringParameters": null,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "<your-json-body-or-null>",
  "isBase64Encoded": false,
  "requestContext": {
    "stage": "local",
    "requestId": "local-request-id"
  }
}
```

---

### `lambdaforge invoke`

Invokes the Lambda handler function locally with the specified event.

```
lambdaforge invoke --handler <path::function_name> [--event event.json] [--mock <services>]
```

- `--handler` — file path to the handler module and function name, separated by `::`, e.g. `src/handler.py::lambda_handler`. The file path is relative to the current working directory. The module is loaded via `importlib.util.spec_from_file_location`. The `::` portion identifies the callable attribute within that module. If the file does not exist, the CLI prints `Error: handler file not found: <path>` and exits with code 1.
- `--event` — path to the event JSON file (default: `event.json`). If the file does not exist, the CLI prints `Error: event file not found: <path>` and exits with code 1. If the file exists but contains invalid JSON, the CLI prints `Error: event file is not valid JSON: <path>` and exits with code 1.
- `--mock` — comma-separated list of AWS services to announce and validate, e.g. `dynamodb,s3`. Valid values are defined in `mocking.SUPPORTED_SERVICES` (the canonical list): `dynamodb`, `s3`, `ssm`, `sqs`, `sns`. If an unrecognized service name is passed, the CLI prints `Error: unknown service "<name>". Valid options: dynamodb, s3, ssm, sqs, sns` and exits with code 1. Note: the actual mocking is performed by a single `mock_aws()` context manager which intercepts all boto3 calls regardless of which services are listed. The `--mock` flag controls what is displayed in the output header and validates for typos — it does not selectively activate per-service mocks.

The handler is invoked directly in-process. A mock `LambdaContext` object is constructed and passed alongside the event.

---

## Mock LambdaContext

A `LambdaContext` dataclass is constructed in `invoker.py` with the following fixed default values:

| Attribute | Default value |
|---|---|
| `function_name` | `"lambdaforge-local"` |
| `function_version` | `"$LATEST"` |
| `invoked_function_arn` | `"arn:aws:lambda:us-east-1:000000000000:function:lambdaforge-local"` |
| `memory_limit_in_mb` | `128` |
| `aws_request_id` | UUID4 generated at invocation time |
| `log_group_name` | `"/aws/lambda/lambdaforge-local"` |
| `log_stream_name` | `"local"` |
| `get_remaining_time_in_millis()` | Returns `30000` (30 seconds) |

Any handler attribute access beyond these fields will raise `AttributeError` as normal Python would. This is acceptable for v1.

---

## Supported Triggers

| Trigger | CLI value | AWS Event Schema |
|---|---|---|
| API Gateway REST proxy | `apigateway` | `APIGatewayProxyEvent` |
| SQS | `sqs` | `SQSEvent` |
| S3 object created | `s3` | `S3Event` |
| SNS | `sns` | `SNSEvent` |
| EventBridge / scheduled | `eventbridge` | `EventBridgeEvent` |

Additional triggers can be added in future versions.

---

## AWS Service Mocking

When `--mock` is passed, `lambdaforge` activates `moto` mocks before invoking the handler. This intercepts all `boto3` calls within the handler and routes them to in-memory fake AWS services.

**Moto version:** moto 4.x or later. The unified `mock_aws()` context manager (not per-service decorators, which are deprecated in moto 4+) is used. `mocking.py` enters `mock_aws()` as a context manager wrapping the handler invocation, regardless of which services are specified. All boto3 calls inside the handler are intercepted. The `--mock` flag controls what is announced in the output and validates service names against `mocking.SUPPORTED_SERVICES` to catch typos — it does not selectively activate per-service mocks.

**Supported services in v1 (`mocking.SUPPORTED_SERVICES`):** `dynamodb`, `s3`, `ssm`, `sqs`, `sns`

The handler code requires no changes — `boto3` calls behave identically, just against local state.

### v1 Limitation: Empty State

Moto starts with empty state. A mocked DynamoDB table exists but has no items; a mocked S3 bucket has no objects. Handlers that read existing data will behave differently than in production.

**This is a known limitation of v1** and is documented clearly in the README. Users who need pre-populated state should seed it themselves at the top of their handler (behind an env var guard) or use a test fixture. Automatic seeding via a `--seed` file is planned for v2.

---

## Output Format

All output is rendered with `rich` for readability:

- **Return value** — pretty-printed JSON (or raw string if not JSON)
- **Stdout / logging** — captured using `contextlib.redirect_stdout` for `print()` calls. A `logging.StreamHandler` pointed at the captured stream is injected into the root logger before invocation and removed after, so standard `logging` calls are also captured. Third-party loggers that bypass the root logger are not guaranteed to be captured.
- **Execution duration** — shown after completion
- **Errors** — if the handler raises an exception, the full Python traceback is printed with the exception type and message highlighted, and the CLI exits with code 1.

**Success output example:**

```
✓ Handler: src/handler.py::lambda_handler
✓ Event:   event.json
✓ Mocks:   dynamodb, s3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Logs:

[INFO] fetching item from table
[INFO] item found

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return value:

{
  "statusCode": 200,
  "body": "{\"message\": \"ok\"}"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Duration: 42ms
```

Captured stdout/logging lines appear in a "Logs" section above the return value. If there is no output, the "Logs" section is omitted. The return value section always appears.

---

## Architecture

```
lambdaforge/
├── cli.py            # Click entry points: generate, invoke
├── events/
│   ├── __init__.py
│   ├── apigateway.py # Event template for API Gateway proxy
│   ├── sqs.py
│   ├── s3.py
│   ├── sns.py
│   └── eventbridge.py
├── invoker.py        # Handler loader, context builder, invocation logic
├── mocking.py        # mock_aws() context manager activation and service registry
└── output.py         # Rich-based output formatting
```

Each event module exposes a single `generate() -> dict` function returning the base event. The CLI writes this to a JSON file.

`invoker.py` handles dynamic import of the handler function from the user-provided file path using `importlib.util.spec_from_file_location`, constructs the mock `LambdaContext`, captures stdout/logging, and calls `handler(event, context)`.

`mocking.py` exposes a context manager that activates `mock_aws()` and defines `SUPPORTED_SERVICES` — the canonical list of valid service names. `cli.py` imports `SUPPORTED_SERVICES` from `mocking.py` to perform validation; the list is not duplicated elsewhere.

---

## Packaging

- **`pyproject.toml`** — build system: `hatchling`
- **Entry point:** `lambdaforge = "lambdaforge.cli:cli"`
- **Dependencies:** `click`, `moto[all]`, `rich` — `moto[all]` is used for simplicity in v1 rather than enumerating per-service extras; narrowing the extras list is a v2 concern
- **Python:** ≥ 3.9
- **License:** MIT
- **Distribution:** PyPI (`lambdaforge`)

---

## Out of Scope (v1)

- Seed files for pre-populating mock state
- Watch mode (re-invoke on file change)
- Support for container-based Lambdas
- Non-Python Lambda runtimes
- SAM / CloudFormation integration

---

## Portfolio Context

This project is built as a standalone open-source tool and added to the portfolio to demonstrate:
- Python CLI development and PyPI packaging
- Deep AWS/Lambda knowledge applied to developer tooling
- Practical problem-solving for real developer pain points

Git commits are backdated across a realistic development timeline of several months at small, incremental intervals to reflect authentic development history.
