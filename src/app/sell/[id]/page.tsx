import { notFound, redirect } from 'next/navigation';
import { ProductForm } from '../ProductForm';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/session';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) redirect('/login?next=%2Fmy-products');
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findFirst({
      where: { id, sellerId: user.id },
      include: { images: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);
  if (!product) notFound();

  return (
    <div className="container-shell py-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">My Products</p>
        <h1 className="text-3xl font-black text-slate-900">Edit listing</h1>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
