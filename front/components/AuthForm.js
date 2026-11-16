'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Alert, Logo, Spinner } from './ui';

export default function AuthForm({ mode }) {
  const isSignUp = mode === 'sign-up';
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) await signUp(form);
      else await signIn({ email: form.email, password: form.password });
      router.push('/dashboard');
    } catch (err) {
      setError(err.body?.details ? `${err.body.error}: ${err.body.details}` : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-paper px-5 py-16 sm:py-24">
      <div className="rise mx-auto w-full max-w-[440px]">
        <div className="text-center">
          <Logo className="mx-auto size-14 rounded-[16px]!" />
          <h1 className="headline mt-6 text-[34px]">{isSignUp ? 'Create your account.' : 'Sign in.'}</h1>
          <p className="mt-2 text-[17px] text-mute">
            {isSignUp ? 'One account for the whole Acquisitions API.' : 'Welcome back. Pick up where you left off.'}
          </p>
        </div>

        <form onSubmit={submit} className="tile mt-10 space-y-5 p-8">
          {isSignUp && (
            <Field label="Full name">
              <input className="input" placeholder="Ana Popescu" value={form.name} onChange={set('name')} required />
            </Field>
          )}
          <Field label="Email">
            <input className="input" type="email" placeholder="name@example.com" value={form.email} onChange={set('email')} required />
          </Field>
          <Field label="Password" hint={isSignUp ? 'At least 6 characters' : undefined}>
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={set('password')} required />
          </Field>
          {isSignUp && (
            <Field label="Role">
              <div className="segmented w-full">
                {['user', 'admin'].map(r => (
                  <button type="button" key={r} data-active={form.role === r} onClick={() => setForm(f => ({ ...f, role: r }))} className="flex-1">
                    {r}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <Alert>{error}</Alert>

          <button className="btn-primary w-full py-3!" disabled={loading}>
            {loading && <Spinner />}
            {isSignUp ? 'Continue' : 'Sign in'}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[12px] text-mute-2">
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z" />
            </svg>
            Session secured with an httpOnly JWT cookie
          </p>
        </form>

        <p className="mt-8 text-center text-[14px] text-mute">
          {isSignUp ? 'Already have an account? ' : 'New to Acquisitions? '}
          <Link href={isSignUp ? '/sign-in' : '/sign-up'} className="link">
            {isSignUp ? 'Sign in ›' : 'Create one now ›'}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-[13px] font-medium text-ink-2">
        {label}
        {hint && <span className="font-normal text-mute-2">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
