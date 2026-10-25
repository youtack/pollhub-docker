# PollHub — microservices

A small polling app built as independent services. The application code is complete. The container setup is left to build.

## Architecture
```
browser → web (nginx) → api (Node/Express) → db (Postgres)
                                  ↑
                             cache (Redis) ← worker (Node)
```

- **web** — nginx. Serves the static UI and forwards `/api` to the api service.
- **api** — Node/Express. Creates polls, records votes (Postgres), counts totals (Redis).
- **worker** — Node. Reads the vote total from Redis on a timer and stores an aggregated value.
- **db** — Postgres. Holds polls and their vote counts.
- **cache** — Redis. Holds the live vote counter.

## Project layout
```
api/        Node service  (src/server.js, package.json)
worker/     Node service  (src/worker.js, package.json)
web/        Static UI + nginx config (public/, build.js, nginx.conf, package.json)
db/         init.sql (seed schema)
.env.example
```

## Endpoints
- `GET  /health`
- `GET  /api/polls`
- `POST /api/polls` — body: `{ "question": "...", "options": ["A","B"] }`
- `POST /api/polls/:id/vote` — body: `{ "option": 0 }`
- `GET  /api/stats`

## Ports
- web: `8080` → `80`
- api: `3000`
- db: `5432`
- cache: `6379`

## What to build
See `TASK.md`.

## Run (after the container files are in place)
```
cp .env.example .env
docker compose up --build
```
Open http://localhost:8080
