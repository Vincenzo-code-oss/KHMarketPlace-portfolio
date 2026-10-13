'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ProductActions({ productId, isActive }: { productId: string; isActive: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteProduct() {
    if (!window.confirm('Delete this listing from the marketplace?')) return;
    setError('');
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not delete this listing.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete this listing.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/sell/${productId}`} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Edit</Link>
      <button type="button" onClick={deleteProduct} disabled={isDeleting} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60">
        {isDeleting ? 'Deleting...' : isActive ? 'Delete' : 'Remove'}
      </button>
      {error ? <span role="alert" className="text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
