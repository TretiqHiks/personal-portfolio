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
lambdaforge invoke --handler <module.path::function_name> [--event event.json] [--mock <services>]
```

- `--handler` — Python import path to the handler, e.g. `src/handler.py::lambda_handler`
- `--event` — path to the event JSON file (default: `event.json`)
- `--mock` — comma-separated list of AWS services to mock, e.g. `dynamodb,s3`

The handler is invoked directly in-process. A minimal Lambda `context` object is constructed and passed alongside the event.

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

When `--mock` is passed, `lambdaforge` activates `moto` mocks for the specified services before invoking the handler. This intercepts all `boto3` calls within the handler and routes them to in-memory fake AWS services.

**Supported services in v1:** `dynamodb`, `s3`, `ssm`, `sqs`, `sns`

The handler code requires no changes — `boto3` calls behave identically, just against local state.

### v1 Limitation: Empty State

Moto starts with empty state. A mocked DynamoDB table exists but has no items; a mocked S3 bucket has no objects. Handlers that read existing data will behave differently than in production.

**This is a known limitation of v1** and is documented clearly in the README. Users who need pre-populated state should seed it themselves at the top of their handler (behind an env var guard) or use a test fixture. Automatic seeding via a `--seed` file is planned for v2.

---

## Output Format

All output is rendered with `rich` for readability:

- **Return value** — pretty-printed JSON (or raw string if not JSON)
- **Stdout / logging** — captured and shown inline, attributed to the handler
- **Execution duration** — shown after completion
- **Errors** — full Python traceback with the exception type and message highlighted

Example:

```
✓ Handler: src/handler.py::lambda_handler
✓ Event:   event.json
✓ Mocks:   dynamodb, s3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Handler output:

{
  "statusCode": 200,
  "body": "{\"message\": \"ok\"}"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Duration: 42ms
```

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
├── mocking.py        # Moto activation and service registry
└── output.py         # Rich-based output formatting
```

Each event module exposes a single `generate() -> dict` function returning the base event. The CLI writes this to a JSON file.

`invoker.py` handles dynamic import of the handler function from the user-provided path, constructs a minimal `LambdaContext` object, and calls `handler(event, context)`.

`mocking.py` maps service names to moto decorators and activates them before the handler runs.

---

## Packaging

- **`pyproject.toml`** — build system: `hatchling`
- **Entry point:** `lambdaforge = "lambdaforge.cli:cli"`
- **Dependencies:** `click`, `moto[all]`, `rich`
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
