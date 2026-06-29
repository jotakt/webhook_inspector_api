# Hookcheck

Webhook inspector and relay built with Fresh, Deno KV and Server-Sent Events.

Hookcheck generates temporary URLs for receiving, inspecting and forwarding webhooks during development. It is useful for debugging integrations with services like Stripe, GitHub, payment platforms and other third-party APIs before implementing the final backend handler.

[![Icoziv-icons](https://i.icoziv.workers.dev/icons?i=deno,typescript,linux-dark)](https://i.icoziv.workers.dev)

## Features

- Generate unique webhook inspector URLs
- Receive `POST`, `PUT`, `PATCH` and `DELETE` requests
- Inspect headers, query params and request body
- Parse JSON payloads when possible
- Store logs temporarily with Deno KV TTL
- Display incoming webhooks in real time with Server-Sent Events
- Copy webhook URL
- Clear channel logs
- Name channels
- Configure relay forwarding to another endpoint
- View relay attempt history

## Tech Stack

[![Icoziv-icons](https://i.icoziv.workers.dev/icons?i=deno-dark,fresh-dark,tailwindcss-dark,typescript)](https://i.icoziv.workers.dev)

- **Deno** — runtime, tooling and deployment target
- **Fresh** — full-stack web framework
- **TypeScript** — application language
- **Preact** — interactive islands
- **Deno KV** — temporary persistence for logs, channel settings and relay attempts
- **Server-Sent Events** — real-time updates without polling
- **Tailwind CSS** — UI styling

## What Hookcheck does

A normal webhook integration usually looks like this:

```txt
External service → Your backend
````

Hookcheck adds an inspection layer:

```txt
External service → Hookcheck → Optional relay target
```

This lets you see the real request before writing or finalizing your backend logic.

You can inspect:

* HTTP method
* Headers
* Query params
* Raw body
* Parsed JSON body
* Content type
* Payload size
* Received timestamp
* Relay result, when forwarding is configured

## Local Development

Install Deno first:

```bash
deno --version
```

Run the development server:

```bash
deno task dev
```

Open:

```txt
http://localhost:5173
```

## Deno Deploy

Production URL:

```txt
https://hookcheck.joma.deno.net/
```

Preview URL:

```txt
https://hookcheck--main.joma.deno.net
```

Hookcheck uses Deno KV, so the Deno Deploy project must have a database/KV instance configured. Without it, routes that call `Deno.openKv()` may fail in production.

## Development Tunnel

Deno Deploy Tunnel can expose your local development server to the internet.

```bash
deno task --tunnel dev
```

Use the generated public tunnel URL when configuring third-party webhook providers.

## Main Routes

| Method   | Route                    | Description                          |
| -------- | ------------------------ | ------------------------------------ |
| `GET`    | `/`                      | Home page                            |
| `GET`    | `/docs`                  | API documentation                    |
| `GET`    | `/inspect/:channel`      | Inspector dashboard                  |
| `POST`   | `/api/hooks/:channel`    | Receive webhook                      |
| `PUT`    | `/api/hooks/:channel`    | Receive webhook                      |
| `PATCH`  | `/api/hooks/:channel`    | Receive webhook                      |
| `DELETE` | `/api/hooks/:channel`    | Receive webhook                      |
| `GET`    | `/api/events/:channel`   | SSE stream for real-time updates     |
| `GET`    | `/api/channels/:channel` | Get channel configuration            |
| `PUT`    | `/api/channels/:channel` | Update channel name and relay target |
| `DELETE` | `/api/logs/:channel`     | Clear channel logs                   |

## Example

Send a test webhook:

```bash
curl.exe -X POST "http://localhost:5173/api/hooks/demo1234" \
  -H "content-type: application/json" \
  -d '{"event":"payment.succeeded","amount":14990}'
```

Expected response:

```json
{
  "ok": true,
  "saved": true,
  "relayed": false,
  "source": "file-route",
  "channel": "demo1234",
  "id": "...",
  "method": "POST",
  "receivedAt": "..."
}
```

## Relay

A channel can optionally forward incoming webhooks to another endpoint.

Example:

```txt
POST /api/hooks/origin
```
with relay configured to:

```txt
https://your-backend.com/webhooks/stripe
```

The request is stored in Hookcheck and then forwarded to the configured target. Each relay attempt is recorded with:

* Target URL
* Status
* Response status
* Response body
* Error message, when applicable
* Duration in milliseconds
* Timestamp

## Roadmap

### v1.5

* Copy webhook URL
* Clear logs
* Name channels
* Relay to another endpoint
* Relay history

### What comes next

* Optional authentication
* Channel secrets
* HMAC signature validation
* Search and filters
* Manual replay
* Rate limiting
