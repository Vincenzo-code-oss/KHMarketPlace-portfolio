'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle2, CreditCard, Facebook, Instagram, MapPin, Music2, Send, ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

const marketplaceLinks = [
  { label: 'Browse products', href: '/search' },
  { label: 'Categories', href: '/categories' },
  { label: 'Featured products', href: '/#featured' },
  { label: 'New arrivals', href: '/#new-arrivals' },
  { label: 'Popular products', href: '/#popular' },
  { label: 'Sell an item', href: '/sell' },
];

const supportLinks = [
  { label: 'Help center', href: '/help' },
  { label: 'Contact us', href: '/contact' },
  { label: 'Safety tips', href: '/safety' },
  { label: 'Report a problem', href: '/report' },
  { label: 'Terms & conditions', href: '/terms' },
  { label: 'Privacy policy', href: '/privacy' },
];

const categories = [
  { label: 'Phones & Tablets', slug: 'phones-tablets' },
  { label: 'Computers & Laptops', slug: 'computers-laptops' },
  { label: 'Fashion', slug: 'fashion' },
  { label: 'Cars', slug: 'cars' },
  { label: 'Motorcycles', slug: 'motorcycles' },
  { label: 'Gaming', slug: 'gaming' },
  { label: 'Home & Living', slug: 'home-living' },
  { label: 'Cameras', slug: 'cameras' },
  { label: 'Beauty', slug: 'beauty' },
  { label: 'Other', slug: 'other' },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="w-fit text-sm text-slate-300 transition-colors duration-200 hover:text-teal-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300">
      {children}
    </Link>
  );
}

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'success' | 'error' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('khmarket-language');
    if (savedLanguage === 'en' || savedLanguage === 'km') setLanguage(savedLanguage);
  }, []);

  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return null;
  }

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterMessage('');
    setNewsletterStatus('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setNewsletterStatus('error');
        setNewsletterMessage(result.error ?? 'Subscription failed. Please try again.');
        return;
      }

      setNewsletterStatus('success');
      setNewsletterMessage(result.message ?? 'You are subscribed to KHMarket updates.');
      setEmail('');
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLanguageChange(value: string) {
    setLanguage(value);
    window.localStorage.setItem('khmarket-language', value);
  }

  return (
    <footer className="footer-enter mt-16 bg-[#101b1f] text-white">
      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <section className="order-2 border-b border-white/10 py-8 lg:order-1 lg:py-9" aria-labelledby="footer-newsletter-title">
          <div className="grid gap-6 lg:grid-cols-[1fr,1.1fr] lg:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Marketplace notes</p>
              <h2 id="footer-newsletter-title" className="text-xl font-bold sm:text-2xl">Stay updated with KHMarket</h2>
              <p className="mt-2 max-w-lg text-sm text-slate-300">Get the latest products, deals and marketplace updates.</p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap" onSubmit={handleSubscribe}>
              <label className="sr-only" htmlFor="footer-newsletter-email">Email address</label>
              <input
                id="footer-newsletter-email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
              {newsletterMessage && (
                <p role="status" aria-live="polite" className={`text-sm sm:basis-full ${newsletterStatus === 'success' ? 'text-teal-300' : 'text-rose-300'}`}>
                  {newsletterMessage}
                </p>
              )}
            </form>
          </div>
        </section>

        <div className="order-1 grid gap-x-8 gap-y-10 border-b border-white/10 py-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:order-2">
          <section className="sm:col-span-2 md:col-span-1" aria-labelledby="footer-brand-title">
            <Link href="/" className="inline-flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400 text-lg font-black text-slate-950">K</span>
              <span id="footer-brand-title" className="text-xl font-black tracking-tight">KHMarket</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">KHMarket is a modern Cambodia marketplace where people can buy and sell products easily and safely.</p>
            <div className="mt-5 flex items-center gap-2" aria-label="Social platforms">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-lg border border-white/10 p-2.5 text-slate-300 transition duration-200 hover:-translate-y-1 hover:border-teal-300/50 hover:bg-teal-300/10 hover:text-teal-300"><Facebook className="h-4 w-4" /></a>
              <a href="https://t.me/" target="_blank" rel="noreferrer" aria-label="Telegram" className="rounded-lg border border-white/10 p-2.5 text-slate-300 transition duration-200 hover:-translate-y-1 hover:border-teal-300/50 hover:bg-teal-300/10 hover:text-teal-300"><Send className="h-4 w-4" /></a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="TikTok" className="rounded-lg border border-white/10 p-2.5 text-slate-300 transition duration-200 hover:-translate-y-1 hover:border-teal-300/50 hover:bg-teal-300/10 hover:text-teal-300"><Music2 className="h-4 w-4" /></a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-lg border border-white/10 p-2.5 text-slate-300 transition duration-200 hover:-translate-y-1 hover:border-teal-300/50 hover:bg-teal-300/10 hover:text-teal-300"><Instagram className="h-4 w-4" /></a>
            </div>
          </section>

          <section aria-labelledby="footer-marketplace-title">
            <h2 id="footer-marketplace-title" className="mb-4 text-sm font-bold text-white">Marketplace</h2>
            <nav className="flex flex-col gap-3">
              {marketplaceLinks.map((link) => <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>)}
            </nav>
          </section>

          <section aria-labelledby="footer-support-title">
            <h2 id="footer-support-title" className="mb-4 text-sm font-bold text-white">Customer support</h2>
            <nav className="flex flex-col gap-3">
              {supportLinks.map((link) => <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>)}
            </nav>
          </section>

          <section aria-labelledby="footer-categories-title">
            <h2 id="footer-categories-title" className="mb-4 text-sm font-bold text-white">Popular categories</h2>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-3 xl:grid-cols-1">
              {categories.map((category) => (
                <FooterLink key={category.slug} href={`/search?category=${category.slug}`}>{category.label}</FooterLink>
              ))}
            </nav>
          </section>

          <section aria-labelledby="footer-cambodia-title">
            <h2 id="footer-cambodia-title" className="mb-4 text-sm font-bold text-white">Cambodia</h2>
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-300"><MapPin className="mt-1 h-4 w-4 shrink-0 text-teal-300" />Phnom Penh, Cambodia</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Support languages</p>
            <p className="mt-2 text-sm text-slate-200">🇰🇭 Khmer <span className="px-1 text-slate-500">·</span> 🇺🇸 English</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-teal-300"><CheckCircle2 className="h-4 w-4" />Available across Cambodia</p>
          </section>
        </div>

        <section className="order-3 flex flex-col gap-5 border-b border-white/10 py-6 md:flex-row md:items-center md:justify-between" aria-label="Payment and trust information">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-300/10 text-teal-300"><ShieldCheck className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-white">Secure & trusted marketplace</p>
              <p className="mt-1 text-xs text-slate-400">Use account sign-in and contact sellers through KHMarket.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-200">
            <span className="mr-1 text-slate-400">Payment options</span>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2"><CreditCard className="h-4 w-4 text-teal-300" />KHQR</span>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2">Cash on Delivery</span>
          </div>
        </section>

        <div className="order-4 flex flex-col gap-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 KHMarket. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/cookies">Cookies</FooterLink>
            <label className="sr-only" htmlFor="footer-language">Language</label>
            <select
              id="footer-language"
              value={language}
              onChange={(event) => handleLanguageChange(event.target.value)}
              className="rounded-md border border-white/15 bg-[#101b1f] px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-teal-300"
            >
              <option value="km">🇰🇭 Khmer</option>
              <option value="en">🇺🇸 English</option>
            </select>
            <a href="#top" className="inline-flex items-center gap-1 text-slate-300 transition-colors hover:text-teal-300">Back to top <ArrowUpRight className="h-3 w-3" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
