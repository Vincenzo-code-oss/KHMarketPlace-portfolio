'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Heart, LogOut, MessageSquareText, ShoppingCart, User } from 'lucide-react';
import { useEffect, useState } from 'react';

type NavUser = {
  name: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  membership: string;
  premiumStatus: string;
  premiumEndDate: string | null;
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<NavUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isPremium = Boolean(user
    && user.membership === 'PREMIUM'
    && user.premiumStatus === 'ACTIVE'
    && (!user.premiumEndDate || new Date(user.premiumEndDate).getTime() > Date.now()));

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (response) => {
        const result = (await response.json()) as { user?: NavUser | null };
        if (active) setUser(response.ok ? result.user ?? null : null);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => { active = false; };
  }, [pathname]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) return;
      setUser(null);
      router.replace('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header id="top" className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">K</div>
          <div>
            <div className="text-lg font-black tracking-tight text-slate-900">KHMarket</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Cambodia</div>
          </div>
        </Link>

        <div className="hidden flex-1 md:block">
          <div className="mx-auto max-w-xl rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 shadow-sm">
            Search products, phones, cars, houses...
          </div>
        </div>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-700 lg:flex">
          <Link href="/search">Browse</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/favorites">Favorites</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/premium">Premium</Link>
          <Link href="/profile">Profile</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700">
            <Bell className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700">
            <Heart className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700">
            <MessageSquareText className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700">
            <ShoppingCart className="h-4 w-4" />
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className={isPremium ? 'rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800' : 'rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600'}>{isPremium ? 'PREMIUM' : 'FREE'}</span>
              <Link href="/profile" aria-label={`${user.name} profile`} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:border-teal-300">
                <User className="h-4 w-4" />
              </Link>
              {user.role === 'SELLER' && <Link href="/dashboard/seller" className="hidden text-sm font-semibold text-slate-700 xl:inline">Seller dashboard</Link>}
              {user.role === 'ADMIN' && <Link href="/admin" className="hidden text-sm font-semibold text-slate-700 xl:inline">Admin</Link>}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Log out"
                title="Log out"
                className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:border-teal-300 hover:text-teal-700 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm">
              <span className="inline-flex items-center gap-2"><User className="h-4 w-4" /> Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
