<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Report;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'premium_users' => User::where('membership', 'PREMIUM')->where('premium_status', 'ACTIVE')->where(fn ($query) => $query->whereNull('premium_end_date')->orWhere('premium_end_date', '>', now()))->count(),
            'products' => Product::count(),
            'orders' => Order::count(),
            'revenue' => (float) Order::whereIn('status', ['COMPLETED', 'DELIVERED'])->sum('total'),
            'reports' => Report::where('status', 'open')->count(),
            'reviews' => Review::count(),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->string('membership')->isNotEmpty(), fn ($query) => $query->where('membership', $request->string('membership')))
            ->latest()
            ->paginate(30);

        return response()->json($users);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'membership' => ['sometimes', 'in:FREE,PREMIUM'],
            'is_verified' => ['sometimes', 'boolean'],
            'role' => ['sometimes', 'in:USER,SELLER'],
        ]);
        abort_if($user->id === $request->user()->id && ($data['role'] ?? null) !== null && $data['role'] !== 'ADMIN', 422, 'You cannot remove your own admin access.');

        if (($data['membership'] ?? null) === 'PREMIUM') {
            $data['premium_status'] = 'ACTIVE';
            $data['premium_start_date'] = now();
            $data['premium_end_date'] = now()->addMonthNoOverflow();
        } elseif (($data['membership'] ?? null) === 'FREE') {
            $data['premium_status'] = 'NONE';
            $data['premium_start_date'] = null;
            $data['premium_end_date'] = null;
        }

        $user->update($data);

        return response()->json(['user' => $user->fresh()]);
    }

    public function products(Request $request)
    {
        $products = Product::query()
            ->with(['category', 'seller', 'images'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(30);

        return ProductResource::collection($products);
    }

    public function removeProduct(Product $product): JsonResponse
    {
        if ($product->orderItems()->exists()) {
            $product->update(['status' => 'removed']);
        } else {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->path);
            }
            $product->delete();
        }

        return response()->json(['deleted' => true]);
    }

    public function categories(): JsonResponse
    {
        return response()->json(Category::orderBy('name')->get());
    }

    public function saveCategory(Request $request, ?Category $category = null): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'slug' => ['nullable', 'string', 'max:120', Rule::unique('categories', 'slug')->ignore($category?->id)],
            'icon' => ['nullable', 'string', 'max:32'],
        ]);
        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        validator(['slug' => $data['slug']], [
            'slug' => ['required', Rule::unique('categories', 'slug')->ignore($category?->id)],
        ])->validate();
        $category ??= new Category;
        $category->fill($data)->save();

        return response()->json(['category' => $category], $category->wasRecentlyCreated ? 201 : 200);
    }

    public function deleteCategory(Category $category): JsonResponse
    {
        abort_if($category->products()->exists(), 409, 'Move or remove the category products before deleting this category.');
        $category->delete();

        return response()->json(['deleted' => true]);
    }

    public function reports(): JsonResponse
    {
        return response()->json(Report::with('reporter:id,name,email')->latest()->paginate(30));
    }

    public function updateReport(Request $request, Report $report): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:open,reviewing,resolved,dismissed']]);
        $report->update($data);

        return response()->json(['report' => $report]);
    }

    public function reviews(): JsonResponse
    {
        return response()->json(Review::with(['user:id,name,username', 'product:id,title,slug'])->latest()->paginate(30));
    }

    public function deleteReview(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json(['deleted' => true]);
    }
}
