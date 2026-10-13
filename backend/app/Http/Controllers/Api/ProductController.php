<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreProductRequest;
use App\Http\Requests\Api\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->string('sort')->toString();
        $sortColumn = match ($sort) {
            'oldest' => 'created_at',
            'price-asc' => 'price',
            'price-desc' => 'price',
            'views' => 'views',
            default => 'created_at',
        };
        $sortDirection = match ($sort) {
            'oldest', 'price-asc' => 'asc',
            default => 'desc',
        };

        $products = Product::query()
            ->where('status', 'active')
            ->with(['category', 'seller', 'images'])
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = trim($request->string('q')->toString());
                $query->where(function ($search) use ($term): void {
                    if ($search->getConnection()->getDriverName() === 'mysql') {
                        $search->whereFullText(['title', 'description'], $term)
                            ->orWhere('title', 'like', '%'.$term.'%')
                            ->orWhere('description', 'like', '%'.$term.'%');
                    } else {
                        $search->where('title', 'like', '%'.$term.'%')
                            ->orWhere('description', 'like', '%'.$term.'%');
                    }
                });
            })
            ->when($request->filled('category'), fn ($query) => $query->whereHas('category', fn ($category) => $category->where('slug', $request->string('category'))))
            ->when($request->filled('province'), fn ($query) => $query->where('province', 'like', '%'.$request->string('province').'%'))
            ->when($request->filled('district'), fn ($query) => $query->where('district', 'like', '%'.$request->string('district').'%'))
            ->when($request->filled('condition'), fn ($query) => $query->where('condition', $request->string('condition')))
            ->when($request->filled('minPrice'), fn ($query) => $query->where('price', '>=', $request->float('minPrice')))
            ->when($request->filled('maxPrice'), fn ($query) => $query->where('price', '<=', $request->float('maxPrice')))
            ->when($request->boolean('featured'), fn ($query) => $query->where('is_featured', true))
            ->when($request->filled('seller_id'), fn ($query) => $query->where('seller_id', $request->integer('seller_id')))
            ->orderBy($sortColumn, $sortDirection)
            ->paginate(min(max($request->integer('per_page', 24), 1), 60))
            ->withQueryString();

        return ProductResource::collection($products);
    }

    public function show(Product $product): ProductResource
    {
        abort_unless($product->status === 'active', 404);
        $product->increment('views');
        $product->load(['category', 'seller', 'images']);

        return new ProductResource($product);
    }

    public function bySlug(string $slug): ProductResource
    {
        $product = Product::query()->where('slug', $slug)->firstOrFail();

        return $this->show($product);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->authorize('create', Product::class);
        $data = $request->safe()->except('images');
        $data['seller_id'] = $request->user()->id;
        $data['currency'] = $data['currency'] ?? 'USD';
        $data['status'] = 'active';
        $data['slug'] = Str::slug($data['title']).'-'.Str::lower(Str::random(8));

        $product = Product::create($data);
        $this->storeImages($request, $product);
        $product->load(['category', 'seller', 'images']);

        return (new ProductResource($product))->response()->setStatusCode(201);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);
        $data = $request->safe()->except('images');
        $product->update($data);

        if ($request->hasFile('images')) {
            foreach ($product->images as $oldImage) {
                Storage::disk('public')->delete($oldImage->path);
            }
            $product->images()->delete();
            $this->storeImages($request, $product);
        }

        return new ProductResource($product->load(['category', 'seller', 'images']));
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        if ($product->orderItems()->exists()) {
            $product->update(['status' => 'removed']);

            return response()->json(['deleted' => true, 'preserved_order_history' => true]);
        }

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }
        $product->delete();

        return response()->json(['deleted' => true]);
    }

    public function setStatus(Request $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);
        $data = $request->validate(['status' => ['required', 'in:active,paused,sold']]);
        $product->update(['status' => $data['status']]);

        return new ProductResource($product->load(['category', 'seller', 'images']));
    }

    private function storeImages(StoreProductRequest $request, Product $product): void
    {
        foreach ($request->file('images', []) as $position => $file) {
            $path = $file->storePublicly('products/'.$product->id, 'public');
            $product->images()->create([
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
                'sort_order' => $position,
            ]);
        }
    }
}
