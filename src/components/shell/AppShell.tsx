'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type ThemeMode = 'light' | 'dark';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = window.localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) return 'dark';
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);

    try {
      window.localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const navItems = useMemo(
    () => [
      { name: 'Dashboard', path: '/' },
      { name: 'Village', path: '/village' },
      { name: 'Ledger', path: '/ledger' },
      { name: 'Privacy', path: '/privacy' },
      { name: 'Settings', path: '/settings' },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[color:var(--surface)] text-[color:var(--text)] transition-colors duration-500">
      {/* Humanistic Top Ribbon */}
      <div className="h-3 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--accent-sage)] via-[color:var(--accent-gold)] to-[color:var(--accent-clay)] opacity-90" />
        <div className="absolute inset-0 opacity-40 dark:opacity-25 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.6),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.4),transparent_50%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)/0.78] backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl overflow-hidden relative shadow-lg shadow-black/5 bg-[color:var(--text)] dark:bg-[color:var(--surface)]">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_40%_30%,rgba(212,175,55,0.55),transparent_55%),radial-gradient(circle_at_70%_75%,rgba(140,160,130,0.45),transparent_50%)]" />
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <span className="text-xl font-black text-[color:var(--surface)] dark:text-[color:var(--text)]">U</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase leading-none">Ubuntu Pools</span>
                <span className="text-[9px] font-black uppercase tracking-[0.35em] mt-1 text-[color:var(--accent-sage)]">
                  Collective Prosperity
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-10">
              {navItems.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cx(
                      'text-xs font-black uppercase tracking-widest transition-all',
                      active
                        ? 'opacity-100 text-[color:var(--text)] border-b-2 border-[color:var(--accent-gold)] pb-1'
                        : 'opacity-45 text-[color:var(--muted)] hover:opacity-85'
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <div className="h-6 w-px bg-[color:var(--border)]" />

              <button
                onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                className="p-3 rounded-2xl border border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--surface-2)] transition-all"
                aria-label="Toggle theme"
              >
                {mounted && (theme === 'light' ? (
                  <svg className="w-5 h-5 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 17.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                    />
                  </svg>
                ))}
              </button>

              <div className="flex flex-col items-end px-6 py-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)]">
                <p className="text-[9px] font-black uppercase tracking-widest text-[color:var(--muted)]">Vault Balance</p>
                <p className="text-sm font-black tabular-nums">R 2,300.00</p>
              </div>
            </nav>

            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                className="p-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)]"
                aria-label="Toggle theme"
              >
                {mounted && <span className="text-xs font-black">{theme === 'light' ? '☾' : '☀︎'}</span>}
              </button>

              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="p-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)]"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-8 space-y-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className="block text-2xl font-black tracking-tighter"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <div className="relative w-full border-b border-[color:var(--border)] overflow-hidden">
        <div className="absolute inset-0 opacity-25 dark:opacity-20 bg-[radial-gradient(circle_at_10%_10%,rgba(212,175,55,0.25),transparent_55%),radial-gradient(circle_at_85%_40%,rgba(140,160,130,0.2),transparent_50%),radial-gradient(circle_at_40%_90%,rgba(192,123,91,0.18),transparent_55%)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative">
          <p className="text-[11px] font-black uppercase tracking-[0.9em] text-[color:var(--muted)] opacity-70">I am because we are</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tighter leading-[1.05]">
            Community savings,
            <span className="text-[color:var(--accent-gold)]"> made human</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-sm md:text-base text-[color:var(--muted)] leading-relaxed">
            Ubuntu Pools is a collective coordination layer: trust-based governance, transparent decisions, and shared prosperity—without the cold, banky vibe.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[11px] font-black uppercase tracking-widest">
              Governance
            </div>
            <div className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[11px] font-black uppercase tracking-widest">
              Ledger
            </div>
            <div className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)] text-[11px] font-black uppercase tracking-widest">
              Collective Goals
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {children}
      </main>

      <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[color:var(--text)] dark:bg-[color:var(--surface-2)] flex items-center justify-center">
                <span className="text-sm font-black text-[color:var(--surface)] dark:text-[color:var(--text)]">U</span>
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">Ubuntu Pools</span>
            </div>
            <p className="text-[11px] font-bold text-[color:var(--muted)] uppercase tracking-widest">Community savings redefined.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['Prospectus', 'Privacy', 'Terms', 'Support'].map((label) => (
              <span
                key={label}
                className="text-[9px] font-black uppercase tracking-widest text-[color:var(--muted)] border border-[color:var(--border)] px-3 py-1 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
