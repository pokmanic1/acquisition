export function Logo({ className = 'size-7' }) {
  return (
    <span className={`${className} grid place-items-center rounded-[9px] bg-ink`}>
      <svg viewBox="0 0 24 24" className="size-[58%] text-white" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19 12 5l7 14" />
        <path d="M8.2 13.5h7.6" />
      </svg>
    </span>
  );
}

export function RoleBadge({ role }) {
  const admin = role === 'admin';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${
        admin ? 'bg-[#f3ecff] text-[#7a3ee0]' : 'bg-[#e8f2ff] text-[#0066cc]'
      }`}
    >
      <span className={`size-1.5 rounded-full ${admin ? 'bg-[#8e4ff0]' : 'bg-[#0071e3]'}`} />
      {role}
    </span>
  );
}

const palette = ['#ff9f0a', '#30d158', '#64d2ff', '#bf5af2', '#ff375f', '#5e5ce6', '#ffd60a', '#0a84ff'];

export function Avatar({ name, size = 'size-9' }) {
  const initials = (name || '?')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const color = palette[[...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  return (
    <span
      className={`grid ${size} shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white`}
      style={{ background: `linear-gradient(180deg, ${color}cc, ${color})` }}
    >
      {initials}
    </span>
  );
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const styles = kind === 'error' ? 'bg-[#fff2f2] text-[#c4112f]' : 'bg-[#eefbf1] text-[#1a7f37]';
  return <div className={`rounded-xl px-4 py-3 text-[14px] ${styles}`}>{children}</div>;
}

export function Spinner({ light = true }) {
  return (
    <span className={`size-4 animate-spin rounded-full border-2 ${light ? 'border-white/40 border-t-white' : 'border-line border-t-ink'}`} />
  );
}

export function Icon({ d, className = 'size-5', stroke = 1.7 }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {[].concat(d).map(p => (
        <path key={p} d={p} />
      ))}
    </svg>
  );
}
