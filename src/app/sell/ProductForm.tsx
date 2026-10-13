'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type CategoryOption = { id: string; name: string };
type ExistingProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  province: string;
  district: string | null;
  condition: string;
  phone: string | null;
  images: { url: string }[];
};

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image.'));
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

export function ProductForm({ categories, product }: { categories: CategoryOption[]; product?: ExistingProduct }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(product);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const form = new FormData(event.currentTarget);
      const files = Array.from(fileInput.current?.files ?? []);
      if (files.length > 3) throw new Error('Upload up to three product images.');
      if (files.some((file) => file.size > 2 * 1024 * 1024)) throw new Error('Each image must be smaller than 2 MB.');
      if (files.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
        throw new Error('Upload JPEG, PNG, or WebP images.');
      }

      const body = {
        title: String(form.get('title') ?? ''),
        categoryId: String(form.get('categoryId') ?? ''),
        price: Number(form.get('price')),
        description: String(form.get('description') ?? ''),
        province: String(form.get('province') ?? ''),
        district: String(form.get('district') ?? ''),
        condition: String(form.get('condition') ?? ''),
        phone: String(form.get('phone') ?? ''),
        ...(files.length ? { images: await Promise.all(files.map(readImage)) } : {}),
      };
      const response = await fetch(isEditing ? `/api/products/${product?.id}` : '/api/products', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        const message = typeof result.error === 'string' ? result.error : 'Please check the product details and try again.';
        throw new Error(message);
      }
      router.push('/my-products');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this listing.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr,320px]">
      <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">Product name</label>
          <input id="title" name="title" required minLength={3} maxLength={120} defaultValue={product?.title} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="iPhone 15 Pro Max" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="categoryId" className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? categories[0]?.id} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-medium text-slate-700">Price (USD)</label>
            <input id="price" name="price" type="number" min="0.01" step="0.01" required defaultValue={product?.price} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="799" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea id="description" name="description" rows={6} required minLength={10} maxLength={5000} defaultValue={product?.description} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="Describe your item in detail..." />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="province" className="mb-2 block text-sm font-medium text-slate-700">Location / Province</label>
            <input id="province" name="province" required minLength={2} defaultValue={product?.province ?? 'Phnom Penh'} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </div>
          <div>
            <label htmlFor="district" className="mb-2 block text-sm font-medium text-slate-700">District</label>
            <input id="district" name="district" defaultValue={product?.district ?? ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
          </div>
        </div>
      </div>

      <aside className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div>
          <label htmlFor="condition" className="mb-2 block text-sm font-medium text-slate-700">Condition</label>
          <select id="condition" name="condition" defaultValue={product?.condition ?? 'New'} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none">
            {['New', 'Like New', 'Good', 'Used', 'For Parts'].map((condition) => <option key={condition}>{condition}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">Phone number</label>
          <input id="phone" name="phone" defaultValue={product?.phone ?? ''} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" placeholder="012 345 678" />
        </div>

        <div>
          <label htmlFor="images" className="mb-2 block text-sm font-medium text-slate-700">Product images</label>
          {product?.images.length ? <p className="mb-2 text-xs text-slate-500">Current image{product.images.length === 1 ? '' : 's'} will be kept unless you upload replacements.</p> : null}
          <input ref={fileInput} id="images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:font-semibold file:text-primary" />
          <p className="mt-2 text-xs text-slate-500">Up to 3 JPEG, PNG, or WebP images; 2 MB each.</p>
        </div>

        {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/my-products')} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700">Cancel</button>
          <button type="submit" disabled={isSaving} className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
            {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Publish'}
          </button>
        </div>
      </aside>
    </form>
  );
}
