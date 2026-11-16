import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// In development (docker-compose.dev.yml) the app talks to the Neon Local proxy
// instead of Neon Cloud. The serverless driver sends queries over HTTP, so it
// must be pointed at the proxy's plain-HTTP /sql endpoint.
// In production NEON_LOCAL_HOST is unset and the driver uses its default
// HTTPS endpoint derived from DATABASE_URL (…neon.tech).
if (process.env.NEON_LOCAL_HOST) {
  const port = process.env.NEON_LOCAL_PORT || 5432;
  neonConfig.fetchEndpoint = `http://${process.env.NEON_LOCAL_HOST}:${port}/sql`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql);

export { db, sql };
