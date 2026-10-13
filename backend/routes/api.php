<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PremiumController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SellerController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/slug/{slug}', [ProductController::class, 'bySlug']);
Route::get('/products/{product}', [ProductController::class, 'show'])->whereNumber('product');
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/locations', [LocationController::class, 'index']);
Route::post('/newsletter', [NewsletterController::class, 'store'])->middleware('throttle:api');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/premium/checkout', [PremiumController::class, 'checkout'])->middleware('throttle:api');
    Route::get('/seller/dashboard', [SellerController::class, 'dashboard']);
    Route::get('/seller/products', [SellerController::class, 'products']);

    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update'])->whereNumber('product');
    Route::patch('/products/{product}', [ProductController::class, 'update'])->whereNumber('product');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->whereNumber('product');
    Route::patch('/products/{product}/status', [ProductController::class, 'setStatus'])->whereNumber('product');

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{favorite}', [FavoriteController::class, 'destroy'])->whereNumber('favorite');

    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'store']);
    Route::put('/cart/items/{item}', [CartController::class, 'update'])->whereNumber('item');
    Route::delete('/cart/items/{item}', [CartController::class, 'destroy'])->whereNumber('item');

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:api');
    Route::put('/orders/{order}', [OrderController::class, 'update'])->whereNumber('order');
    Route::patch('/orders/{order}', [OrderController::class, 'update'])->whereNumber('order');

    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store'])->middleware('throttle:api');
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->whereNumber('notification');

    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::post('/reports', [ReportController::class, 'store'])->middleware('throttle:api');

    Route::prefix('admin')->middleware('role:ADMIN')->group(function (): void {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::patch('/users/{user}', [AdminController::class, 'updateUser'])->whereNumber('user');
        Route::get('/products', [AdminController::class, 'products']);
        Route::delete('/products/{product}', [AdminController::class, 'removeProduct'])->whereNumber('product');
        Route::get('/categories', [AdminController::class, 'categories']);
        Route::post('/categories', [AdminController::class, 'saveCategory']);
        Route::put('/categories/{category}', [AdminController::class, 'saveCategory'])->whereNumber('category');
        Route::delete('/categories/{category}', [AdminController::class, 'deleteCategory'])->whereNumber('category');
        Route::get('/reports', [AdminController::class, 'reports']);
        Route::patch('/reports/{report}', [AdminController::class, 'updateReport'])->whereNumber('report');
        Route::get('/reviews', [AdminController::class, 'reviews']);
        Route::delete('/reviews/{review}', [AdminController::class, 'deleteReview'])->whereNumber('review');
    });
});
