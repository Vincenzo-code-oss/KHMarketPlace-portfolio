'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminUserActions({
  userId,
  membership,
  isVerified,
}: {
  userId: string;
  membership: string;
  isVerified: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function update(values: { membership?: string; isVerified?: boolean }) {
    setError('');
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not update this user.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update this user.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={busy} onClick={() => update({ membership: membership === 'PREMIUM' ? 'FREE' : 'PREMIUM' })} className="rounded-lg border border-orange-200 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60">
        {membership === 'PREMIUM' ? 'Revoke Premium' : 'Grant Premium'}
      </button>
      <button type="button" disabled={busy} onClick={() => update({ isVerified: !isVerified })} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60">
        {isVerified ? 'Unverify' : 'Verify'}
      </button>
      {error ? <span role="alert" className="w-full text-xs text-red-700">{error}</span> : null}
    </div>
  );
}

export function AdminProductActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function removeProduct() {
    if (!window.confirm('Remove this product from the marketplace?')) return;
    setError('');
    setBusy(true);
    try {
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not remove this product.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not remove this product.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" disabled={busy} onClick={removeProduct} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60">{busy ? 'Removing...' : 'Remove'}</button>
      {error ? <p role="alert" className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
