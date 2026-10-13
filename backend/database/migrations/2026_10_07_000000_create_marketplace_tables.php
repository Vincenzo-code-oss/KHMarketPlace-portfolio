<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('name');
            $table->string('type', 20)->default('province');
            $table->string('slug')->unique();
            $table->timestamps();
            $table->index(['parent_id', 'type']);
        });

        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('icon', 32)->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('title', 160);
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('condition', 40);
            $table->string('province');
            $table->string('district')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('status', 20)->default('active')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->unsignedInteger('views')->default(0);
            $table->timestamps();
            $table->index(['category_id', 'status', 'created_at']);
            $table->index(['province', 'district']);
            $table->index(['seller_id', 'status']);
            if (DB::connection()->getDriverName() === 'mysql') {
                $table->fullText(['title', 'description']);
            }
        });

        Schema::create('product_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('url', 2048);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['product_id', 'sort_order']);
        });

        Schema::create('favorites', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('conversations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->index(['buyer_id', 'updated_at']);
            $table->index(['seller_id', 'updated_at']);
        });

        Schema::create('messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['conversation_id', 'created_at']);
        });

        Schema::create('notifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 80);
            $table->text('text');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'read_at', 'created_at']);
        });

        Schema::create('carts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();
            $table->unique(['cart_id', 'product_id']);
        });

        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->restrictOnDelete();
            $table->string('status', 20)->default('PENDING')->index();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('name');
            $table->string('phone', 40);
            $table->string('province');
            $table->string('district');
            $table->text('address');
            $table->string('payment_method', 30);
            $table->string('payment_status', 20)->default('PENDING');
            $table->timestamps();
            $table->index(['buyer_id', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('seller_id')->constrained('users')->restrictOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('price', 12, 2);
            $table->timestamps();
            $table->index(['seller_id', 'created_at']);
        });

        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 30);
            $table->string('reference')->nullable()->unique();
            $table->decimal('amount', 12, 2);
            $table->string('status', 20)->default('PENDING');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique(['product_id', 'user_id']);
        });

        Schema::create('reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('target_type', 40);
            $table->unsignedBigInteger('target_id');
            $table->string('reason', 100);
            $table->text('details')->nullable();
            $table->string('status', 20)->default('open')->index();
            $table->timestamps();
            $table->index(['target_type', 'target_id']);
        });

        Schema::create('newsletter_subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->string('email')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscriptions');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('locations');
    }
};
