'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const methods = [
  { id: 'ABA_PAY', label: 'ABA Pay' },
  { id: 'WING', label: 'Wing' },
  { id: 'CARD', label: 'Credit or debit card' },
];

export function PremiumCheckoutForm() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('ABA_PAY');
  const [error, setError] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsPaying(true);
    try {
      const response = await fetch('/api/premium/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Demo payment could not be completed.');
      router.push('/');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Demo payment could not be completed.');
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-semibold text-slate-800">Select a payment method</legend>
        {methods.map((method) => (
          <label key={method.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700">
            <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
            {method.label}
          </label>
        ))}
      </fieldset>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={isPaying} className="mt-6 w-full rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60">
        {isPaying ? 'Processing demo payment...' : 'Pay $5.99 and activate Premium'}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">This is a simulated demo payment; no payment details are collected.</p>
    </form>
  );
}
