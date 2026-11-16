import Link from 'next/link';
import { Avatar, Icon, RoleBadge } from '@/components/ui';

const icons = {
  lock: ['M7 11V7a5 5 0 0 1 10 0v4', 'M5 11h14v10H5z'],
  people: ['M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20', 'M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4', 'M15.5 4.1a3.5 3.5 0 0 1 0 6.8'],
  shield: ['M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z', 'm9 12 2 2 4-4'],
  check: ['M9 11.5 11 13.5 15 9.5', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z'],
  db: ['M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z', 'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6', 'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'],
  box: ['M21 8 12 3 3 8v8l9 5 9-5V8Z', 'M3 8l9 5 9-5', 'M12 13v8'],
};

const endpoints = [
  ['GET', '/health', 'Health check with uptime', false],
  ['POST', '/api/auth/sign-up', 'Register a new user', false],
  ['POST', '/api/auth/sign-in', 'Sign in and set the JWT cookie', false],
  ['POST', '/api/auth/sign-out', 'Clear the session cookie', false],
  ['GET', '/api/users', 'List every user', true],
  ['GET', '/api/users/:id', 'Get a single user', true],
  ['PUT', '/api/users/:id', 'Update — yourself, or anyone as admin', true],
  ['DELETE', '/api/users/:id', 'Delete — yourself, or anyone as admin', true],
];

const methodColor = {
  GET: 'text-[#1a7f37]',
  POST: 'text-[#0066cc]',
  PUT: 'text-[#b25000]',
  DELETE: 'text-[#c4112f]',
};

const stack = [
  ['Runtime', 'Node.js · Express 5 · ES Modules'],
  ['Database', 'PostgreSQL on Neon · Drizzle ORM · Drizzle Kit'],
  ['Security', 'JWT · bcrypt · Arcjet · Helmet · CORS · Zod'],
  ['Observability', 'Winston · Morgan'],
  ['Quality', 'Jest · Supertest · ESLint · Prettier'],
  ['Delivery', 'Docker · Docker Compose · GitHub Actions · Docker Hub'],
  ['Interface', 'Next.js · React · Tailwind CSS'],
];

const previewUsers = [
  ['Admin Acquisitions', 'admin@acquisitions.dev', 'admin'],
  ['Ana Popescu', 'ana.popescu@mail.com', 'user'],
  ['Mihai Rusu', 'mihai.rusu@mail.com', 'user'],
  ['Elena Ceban', 'elena.ceban@mail.com', 'admin'],
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="overflow-hidden bg-white pt-20 text-center sm:pt-28">
        <div className="rise mx-auto max-w-[980px] px-5">
          <p className="eyebrow text-[#bf4800]">New · Acquisitions API 1.0</p>
          <h1 className="headline mt-3 text-[48px] leading-[1.05] sm:text-[80px]">
            User management.
            <br />
            <span className="bg-linear-to-r from-[#0071e3] via-[#7a3ee0] to-[#e3365c] bg-clip-text text-transparent">Secured by design.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[19px] leading-[1.45] text-mute sm:text-[21px]">
            A Node.js REST API with JWT authentication, role-based permissions, bot protection and rate limiting — containerised
            with Docker and shipped through GitHub Actions.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary">
              Get started
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Open dashboard
            </Link>
          </div>
        </div>

        {/* Product shot */}
        <div className="rise relative mx-auto mt-16 max-w-[1000px] px-5 [animation-delay:150ms]">
          <div className="pointer-events-none absolute inset-x-20 -bottom-10 top-20 rounded-[50%] bg-[#0071e3]/15 blur-3xl" />
          <div className="relative overflow-hidden rounded-t-[22px] border border-b-0 border-hair bg-white shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-2 border-b border-hair bg-paper px-4 py-3">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
              <span className="mx-auto rounded-md bg-white px-16 py-1 text-[12px] text-mute">localhost:3001/dashboard</span>
            </div>
            <div className="grid gap-4 p-6 text-left sm:grid-cols-3">
              {[
                ['Total users', '6'],
                ['Admins', '2'],
                ['Requests / min', '20'],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-paper p-5">
                  <div className="text-[12px] text-mute">{l}</div>
                  <div className="headline mt-1 text-[34px]">{v}</div>
                </div>
              ))}
            </div>
            <div className="mx-6 mb-0 overflow-hidden rounded-t-2xl border border-b-0 border-hair text-left">
              {previewUsers.map(([n, e, r]) => (
                <div key={e} className="flex items-center gap-3 border-b border-hair px-5 py-3.5 last:border-b-0">
                  <Avatar name={n} />
                  <div>
                    <div className="text-[14px] font-medium">{n}</div>
                    <div className="text-[12px] text-mute">{e}</div>
                  </div>
                  <span className="ml-auto">
                    <RoleBadge role={r} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento */}
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-[1080px] px-5">
          <h2 className="headline max-w-[700px] text-[40px] leading-[1.1] sm:text-[56px]">
            Everything a backend needs. <span className="text-mute-2">Nothing it doesn&apos;t.</span>
          </h2>

          <div className="mt-14 grid gap-5 md:grid-cols-6">
            <Tile className="md:col-span-4" icon={icons.lock} tint="#0071e3" title="Authentication that stays out of reach.">
              Passwords are hashed with bcrypt. JWTs live in httpOnly, SameSite=strict cookies — invisible to JavaScript, useless to
              cross-site requests.
              <div className="mt-8 flex flex-wrap gap-2 font-mono text-[12px]">
                {['httpOnly', 'SameSite=strict', 'Secure in prod', 'expires 1d'].map(t => (
                  <span key={t} className="rounded-full bg-paper px-3 py-1.5 text-ink-2">
                    {t}
                  </span>
                ))}
              </div>
            </Tile>

            <Tile className="md:col-span-2" icon={icons.people} tint="#7a3ee0" title="Two roles. Clear rules.">
              Users manage their own account. Admins manage everyone — and are the only ones who can change roles.
            </Tile>

            <Tile className="md:col-span-2" icon={icons.shield} tint="#1a7f37" title="Arcjet on every request.">
              Shield, bot detection and sliding-window rate limits.
              <div className="mt-6 space-y-2">
                {[
                  ['Guest', 5],
                  ['User', 10],
                  ['Admin', 20],
                ].map(([r, n]) => (
                  <div key={r} className="flex items-center gap-3 text-[13px]">
                    <span className="w-12 text-mute">{r}</span>
                    <span className="h-2 rounded-full bg-[#30d158]" style={{ width: `${n * 4}%` }} />
                    <span className="text-ink">{n}/min</span>
                  </div>
                ))}
              </div>
            </Tile>

            <Tile className="md:col-span-2" icon={icons.check} tint="#bf4800" title="Validated with Zod.">
              Every body and route param is parsed. Unknown fields on update are rejected, not ignored.
            </Tile>

            <Tile className="md:col-span-2" icon={icons.db} tint="#0a84ff" title="Serverless Postgres.">
              Neon + Drizzle ORM with versioned migrations, and Neon Local branches in development.
            </Tile>

            <div className="tile overflow-hidden bg-ink! p-9 text-white md:col-span-6">
              <div className="grid items-center gap-10 md:grid-cols-2">
                <div>
                  <span className="grid size-11 place-items-center rounded-xl bg-white/10">
                    <Icon d={icons.box} />
                  </span>
                  <h3 className="headline mt-6 text-[32px] leading-tight text-white!">From commit to container.</h3>
                  <p className="mt-3 text-[17px] leading-relaxed text-white/60">
                    Multi-stage Dockerfile, dev and prod Compose files, and three GitHub Actions workflows: lint &amp; format, tests with
                    coverage, and a multi-arch image pushed to Docker Hub.
                  </p>
                </div>
                <ol className="space-y-3">
                  {[
                    ['Lint & Format', 'ESLint · Prettier'],
                    ['Tests', 'Jest · Supertest · coverage'],
                    ['Build & Push', 'linux/amd64 + linux/arm64'],
                  ].map(([t, s], i) => (
                    <li key={t} className="flex items-center gap-4 rounded-2xl bg-white/[0.06] px-5 py-4">
                      <span className="grid size-8 place-items-center rounded-full bg-[#30d158] text-[13px] font-semibold text-black">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-[15px] font-medium">{t}</div>
                        <div className="text-[13px] text-white/50">{s}</div>
                      </div>
                      <span className="ml-auto text-[#30d158]">✓</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints + stack */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-[1080px] gap-16 px-5 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow text-[#0071e3]">API</p>
            <h2 className="headline mt-2 text-[40px] leading-tight">Eight endpoints.</h2>
            <div className="mt-8 divide-y divide-hair border-y border-hair">
              {endpoints.map(([m, path, desc, locked]) => (
                <div key={m + path} className="flex items-center gap-4 py-4">
                  <span className={`w-14 font-mono text-[12px] font-semibold ${methodColor[m]}`}>{m}</span>
                  <div className="min-w-0">
                    <code className="font-mono text-[14px] text-ink">{path}</code>
                    <div className="text-[13px] text-mute">{desc}</div>
                  </div>
                  <span className={`ml-auto text-[12px] ${locked ? 'text-ink-2' : 'text-mute-2'}`}>{locked ? 'JWT required' : 'Public'}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow text-[#7a3ee0]">Stack</p>
            <h2 className="headline mt-2 text-[40px] leading-tight">Built with.</h2>
            <dl className="mt-8 space-y-6">
              {stack.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-mute-2">{k}</dt>
                  <dd className="mt-1 text-[17px] text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-paper py-24 text-center">
        <h2 className="headline text-[40px] sm:text-[56px]">Try it yourself.</h2>
        <p className="mt-3 text-[19px] text-mute">Create an account and manage users in seconds.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/sign-up" className="btn-primary">
            Create account
          </Link>
          <Link href="/status" className="btn-secondary">
            View API status
          </Link>
        </div>
      </section>
    </div>
  );
}

function Tile({ className = '', icon, tint, title, children }) {
  return (
    <div className={`tile p-9 ${className}`}>
      <span className="grid size-11 place-items-center rounded-xl" style={{ background: `${tint}14`, color: tint }}>
        <Icon d={icon} />
      </span>
      <h3 className="headline mt-6 text-[26px] leading-[1.15]">{title}</h3>
      <div className="mt-3 text-[16px] leading-relaxed text-mute">{children}</div>
    </div>
  );
}
