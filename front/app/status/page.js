'use client';

import { useEffect, useState } from 'react';
import { api, isDemoForced, setDemoForced } from '@/lib/api';
import { resetDemo } from '@/lib/demo';
import { useAuth } from '@/components/AuthProvider';

const uptimeText = s => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h}h ${m}m ${sec}s`;
};

const services = [
  ['REST API', 'Express 5'],
  ['Database', 'Neon PostgreSQL'],
  ['Arcjet Shield', 'Attack protection'],
  ['Bot detection', 'Search engines & previews allowed'],
  ['Rate limiting', 'Guest 5 · User 10 · Admin 20 / min'],
  ['Secure headers', 'Helmet'],
];

const pipeline = [
  ['Lint and Format', 'lint-and-format.yml', 'ESLint · Prettier check'],
  ['Tests', 'tests.yml', 'Jest · Supertest · coverage report'],
  ['Docker Build and Push', 'docker-build-and-push.yml', 'Buildx · amd64 + arm64 · Docker Hub'],
];

export default function StatusPage() {
  const { source } = useAuth();
  const [health, setHealth] = useState(null);
  const [latency, setLatency] = useState(null);
  const [error, setError] = useState('');
  const [demo, setDemo] = useState(false);
  const [history, setHistory] = useState([]);

  const check = async () => {
    const t = performance.now();
    try {
      const h = await api.health();
      const ms = Math.round(performance.now() - t);
      setHealth(h);
      setLatency(ms);
      setError('');
      setHistory(list => [...list.slice(-39), { ok: true, ms }]);
    } catch (e) {
      setError(e.message);
      setHistory(list => [...list.slice(-39), { ok: false, ms: 0 }]);
    }
  };

  useEffect(() => {
    setDemo(isDemoForced());
    check();
    const id = setInterval(check, 5000);
    return () => clearInterval(id);
  }, []);

  const ok = health?.status === 'OK' && !error;
  const pending = !health && !error;

  return (
    <div className="min-h-[calc(100vh-52px)] bg-paper">
      <div className="rise mx-auto max-w-[880px] px-5 py-16">
        <div className="text-center">
          <span
            className={`mx-auto grid size-16 place-items-center rounded-full text-white ${
              pending ? 'bg-mute-2' : ok ? 'bg-[#30d158] shadow-[0_10px_30px_rgba(48,209,88,0.4)]' : 'bg-[#ff3b30]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              {ok || pending ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M12 7v6M12 17h.01" />}
            </svg>
          </span>
          <h1 className="headline mt-6 text-[40px] leading-tight sm:text-[48px]">
            {pending ? 'Checking…' : ok ? 'All systems operational.' : 'API unreachable.'}
          </h1>
          <p className="mt-2 text-[17px] text-mute">
            {source === 'demo' ? 'Serving in-browser demo data.' : 'Live from Express on localhost:3000.'} Refreshed every 5 seconds.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-5">
          <Metric label="Status" value={health?.status ?? '—'} />
          <Metric label="Uptime" value={health ? uptimeText(health.uptime) : '—'} />
          <Metric label="Latency" value={latency != null ? `${latency} ms` : '—'} />
        </div>

        <div className="tile mt-5 p-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold">GET /health</h2>
            <span className="text-[13px] text-mute">Last {history.length} checks</span>
          </div>
          <div className="mt-5 flex h-10 gap-[3px]">
            {Array.from({ length: 40 }).map((_, i) => {
              const h = history[i - (40 - history.length)];
              return <div key={i} className={`flex-1 rounded-[3px] ${!h ? 'bg-hair' : h.ok ? 'bg-[#30d158]' : 'bg-[#ff3b30]'}`} />;
            })}
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-mute-2">
            <span>Older</span>
            <span>Now</span>
          </div>
          {health && (
            <pre className="mt-6 overflow-x-auto rounded-2xl bg-paper p-5 font-mono text-[13px] leading-relaxed text-ink-2">
              {JSON.stringify(health, null, 2)}
            </pre>
          )}
        </div>

        <h2 className="headline mt-14 text-[28px]">Services</h2>
        <div className="tile mt-5 divide-y divide-hair">
          {services.map(([name, desc]) => (
            <div key={name} className="flex items-center justify-between gap-4 px-7 py-4">
              <div>
                <div className="text-[15px] font-medium">{name}</div>
                <div className="text-[13px] text-mute">{desc}</div>
              </div>
              <span className="flex items-center gap-2 text-[13px] text-[#1a7f37]">
                <span className="size-2 rounded-full bg-[#30d158]" /> Operational
              </span>
            </div>
          ))}
        </div>

        <h2 className="headline mt-14 text-[28px]">Delivery pipeline</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {pipeline.map(([name, file, desc], i) => (
            <div key={file} className="tile p-6">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-mute-2">Step {i + 1}</span>
                <span className="grid size-6 place-items-center rounded-full bg-[#30d158] text-[12px] text-white">✓</span>
              </div>
              <div className="mt-4 text-[17px] font-semibold">{name}</div>
              <div className="mt-1 text-[14px] text-mute">{desc}</div>
              <div className="mt-4 font-mono text-[11px] text-mute-2">.github/workflows/{file}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-mute">
          <span>Demo mode</span>
          <button
            role="switch"
            aria-checked={demo}
            onClick={() => {
              setDemoForced(!demo);
              location.reload();
            }}
            className={`relative h-[26px] w-[44px] rounded-full transition ${demo ? 'bg-[#30d158]' : 'bg-line'}`}
          >
            <span className={`absolute top-[2px] size-[22px] rounded-full bg-white shadow transition-all ${demo ? 'left-[20px]' : 'left-[2px]'}`} />
          </button>
          <button
            onClick={() => {
              resetDemo();
              location.reload();
            }}
            className="link"
          >
            Reset demo users
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="tile px-6 py-5 text-center">
      <div className="text-[13px] text-mute">{label}</div>
      <div className="headline mt-1 text-[22px] sm:text-[28px]">{value}</div>
    </div>
  );
}
