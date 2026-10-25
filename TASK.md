# Task

Write the container setup so the whole app runs with one command. The app code is already finished — only the files below are empty.

## Files to create
- `api/Dockerfile`
- `worker/Dockerfile`
- `web/Dockerfile`
- `docker-compose.yml`

## Steps
1. `api/Dockerfile` — build the Node api, start `node src/server.js`, listen on port 3000.
2. `worker/Dockerfile` — build the Node worker, start `node src/worker.js`. No port.
3. `web/Dockerfile` — run `npm run build`, then serve `dist/` with nginx on port 80 using the provided `nginx.conf`.
4. `docker-compose.yml` — five services: `web`, `api`, `worker`, `db` (Postgres), `cache` (Redis).
5. `cp .env.example .env`
6. `docker compose up --build`
7. Open http://localhost:8080 and vote on a poll.

## Requirements
- Use multi-stage builds.
- Run as a non-root user where possible.
- Add a healthcheck to the services that serve HTTP.
- `api` reads `db` and `cache`; `worker` reads `cache`; `web` talks only to `api`.
- Keep `db` and `cache` off the network that `web` uses.
- Database and cache data survives `docker compose down`.
- Pass database and Redis settings through environment variables.

## Done when
- `docker compose up --build` starts all five services.
- The page at http://localhost:8080 loads, shows polls, and voting updates the counts.
- `docker compose down` then `up` keeps existing polls and votes.

## Deliver
1. Push the completed project to a new GitHub repository.
2. Make sure all four files are committed: `api/Dockerfile`, `worker/Dockerfile`, `web/Dockerfile`, `docker-compose.yml`.
3. Submit the GitHub repository link.
