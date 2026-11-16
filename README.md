# Acquisitions API

An Express 5 API backed by **Neon Postgres** through Drizzle ORM and the `@neondatabase/serverless` driver.

The same Docker image runs in both environments. Only the database connection changes:

|                   | Development                                  | Production                                              |
| ----------------- | -------------------------------------------- | ------------------------------------------------------- |
| Compose file      | `docker-compose.dev.yml`                     | `docker-compose.prod.yml`                               |
| Env file          | `.env.development`                           | `.env.production` (or your platform's secrets)          |
| Docker target     | `development` (hot reload, dev deps)         | `production` (runtime deps only, non-root, healthcheck) |
| Database          | **Neon Local** proxy → ephemeral Neon branch | **Neon Cloud** directly                                 |
| `DATABASE_URL`    | `postgres://neon:npg@neon-local:5432/neondb` | `postgresql://…@…neon.tech/…?sslmode=require`           |
| `NEON_LOCAL_HOST` | `neon-local`                                 | _unset_                                                 |

---

## How the database switch works

[`src/config/database.js`](src/config/database.js) reads two variables:

- **`DATABASE_URL`**: the Postgres connection string.
- **`NEON_LOCAL_HOST`**: when this is set, the serverless driver sends queries to `http://<NEON_LOCAL_HOST>:5432/sql` (the Neon Local proxy) instead of Neon's HTTPS endpoint.

```js
if (process.env.NEON_LOCAL_HOST) {
  neonConfig.fetchEndpoint = `http://${process.env.NEON_LOCAL_HOST}:5432/sql`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}
const sql = neon(process.env.DATABASE_URL);
```

In production `NEON_LOCAL_HOST` is not set, so the driver connects straight to Neon Cloud. The code never contains a connection string. Values are injected through environment variables at runtime, and `.dockerignore` keeps every `.env*` file out of the image.

---

## Local development with Neon Local

[Neon Local](https://neon.com/docs/local/neon-local) is a proxy container. When it starts, it uses the Neon API to create an **ephemeral branch** of your project. When it stops, it deletes that branch. Every `up` therefore gives you a fresh copy-on-write database, and your real data is never touched.

### Prerequisites

- Docker Desktop (or Docker Engine with Compose v2)
- A Neon account and project
- A Neon **API key**: Neon Console → Account settings → API keys
- Your **project ID**: Neon Console → Project settings → General

### 1. Configure `.env.development`

```bash
cp .env.example .env.development
```

Fill in:

```dotenv
NEON_API_KEY=napi_xxxxxxxx
NEON_PROJECT_ID=quiet-forest-123456
# PARENT_BRANCH_ID=br-xxxx   # optional: branch to fork from (default: project default branch)
ARCJET_KEY=ajkey_xxxxxxxx
```

You don't need to change `DATABASE_URL` or `NEON_LOCAL_HOST`, because `docker-compose.dev.yml` sets them for the app container.

### 2. Start the stack

```bash
npm run docker:dev
# = docker compose -f docker-compose.dev.yml up --build
```

This starts:

- **`neon-local`**: creates the ephemeral branch and exposes Postgres on `neon-local:5432` inside the network and on `localhost:5432` on your machine.
- **`app`**: the API at <http://localhost:3000>. Changes in `./src` reload automatically through `node --watch`.

Check that it is running:

```bash
curl http://localhost:3000/health
```

### 3. Run migrations against the ephemeral branch

Each new ephemeral branch is forked from the parent branch, so it already has the parent's schema. Migrations only need to be applied for changes you are developing:

```bash
docker compose -f docker-compose.dev.yml exec app npm run db:migrate
```

> **Note:** `drizzle-kit` chooses its driver based on which packages are installed. With only `@neondatabase/serverless` installed, it tries to reach Neon over WebSockets, which Neon Local does not serve in this setup. Run `npm i -D pg` once so that drizzle-kit uses the standard Postgres protocol instead. It works with both Neon Local and Neon Cloud.

### 4. Stop the stack

```bash
npm run docker:dev:down
```

Stopping Neon Local deletes the ephemeral branch.

### Connecting from the host

Tools such as psql, Drizzle Studio and GUI clients can connect to the proxy:

```
postgres://neon:npg@localhost:5432/neondb?sslmode=require
```

---

## Production with Neon Cloud

Production does **not** run Neon Local. The app container connects directly to your Neon Cloud database. Neon is serverless and managed, so the database itself has no container.

### 1. Provide secrets

On a VM or in a self-managed Docker host, create `.env.production` (it is git-ignored):

```dotenv
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL=postgresql://<user>:<password>@<endpoint>.neon.tech/<dbname>?sslmode=require&channel_binding=require
ARCJET_KEY=ajkey_xxxxxxxx
```

On a managed platform (ECS, Fly.io, Render, Kubernetes, and so on), set the same variables in the platform's secret store. **Do not set `NEON_LOCAL_HOST`.**

### 2. Apply migrations

Apply migrations from CI or a trusted machine before rolling out a release:

```bash
DATABASE_URL="postgresql://…neon.tech/…" npm run db:migrate
```

### 3. Build and run

```bash
npm run docker:prod
# = docker compose -f docker-compose.prod.yml up --build -d
```

Or build and run the image without Compose:

```bash
docker build --target production -t acquisitions-api:latest .
docker run -d -p 3000:3000 --env-file .env.production acquisitions-api:latest
```

The production image:

- installs only runtime dependencies (`npm ci --omit=dev`)
- runs as the unprivileged `node` user
- has a Docker `HEALTHCHECK` on `/health`
- contains no `.env` files or secrets

---

## Command reference

| Command                                            | Purpose                                               |
| -------------------------------------------------- | ----------------------------------------------------- |
| `npm run docker:dev`                               | Start the app and Neon Local (ephemeral branch)       |
| `npm run docker:dev:down`                          | Stop the dev stack and delete the ephemeral branch    |
| `npm run docker:prod`                              | Build and start the production container (Neon Cloud) |
| `npm run docker:prod:down`                         | Stop the production container                         |
| `npm run dev`                                      | Run on the host without Docker (uses `.env`)          |
| `npm start`                                        | Run the production entrypoint on the host             |
| `npm run db:generate` / `db:migrate` / `db:studio` | Drizzle tooling                                       |

## Troubleshooting

- **App can't reach the DB in dev.** Run `docker compose -f docker-compose.dev.yml logs neon-local` and check that `NEON_API_KEY` and `NEON_PROJECT_ID` are valid. Neon Local needs internet access to create the branch.
- **Port 5432 is already in use.** Stop the local Postgres, or change the host side of the mapping to `"5433:5432"`.
- **Hot reload doesn't fire on Windows.** File-change events from Windows bind mounts do not always reach containers. Keep the project inside the WSL2 filesystem, or restart the `app` service.
