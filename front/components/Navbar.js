'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Avatar, Logo } from './ui';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/status', label: 'Status' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, source, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/72 backdrop-blur-2xl backdrop-saturate-200">
      <div className="mx-auto flex h-[52px] max-w-[1080px] items-center gap-8 px-5">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-6" />
          <span className="text-[15px] font-semibold tracking-tight text-ink">Acquisitions</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[13px] transition ${pathname === l.href ? 'text-ink' : 'text-ink/60 hover:text-ink'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <span
            title={source === 'demo' ? 'Backend unreachable — using in-browser demo data' : 'Connected to the Express API'}
            className="hidden items-center gap-1.5 text-[12px] text-mute sm:inline-flex"
          >
            <span className={`size-[7px] rounded-full ${source === 'demo' ? 'bg-[#ff9f0a]' : 'bg-[#30d158]'}`} />
            {source === 'demo' ? 'Demo data' : 'Live API'}
          </span>

          {user ? (
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="size-7" />
              <span className="hidden text-[13px] text-ink sm:inline">{user.name}</span>
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/sign-in');
                }}
                className="text-[13px] text-link hover:underline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="text-[13px] text-ink/70 hover:text-ink">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-full bg-ink px-3.5 py-1 text-[13px] text-white transition hover:bg-black">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
