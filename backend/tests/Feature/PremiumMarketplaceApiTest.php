<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PremiumMarketplaceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_free_users_cannot_create_products_through_the_api(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user)->postJson('/api/products', $this->productPayload())
            ->assertForbidden();

        $this->assertDatabaseCount('products', 0);
    }

    public function test_premium_users_can_create_edit_and_delete_their_products(): void
    {
        $seller = $this->makeUser([
            'membership' => 'PREMIUM',
            'premium_status' => 'ACTIVE',
            'premium_end_date' => now()->addMonth(),
        ]);
        $category = Category::create(['name' => 'Phones & Tablets', 'slug' => 'phones-tablets']);

        $this->actingAs($seller)->postJson('/api/products', $this->productPayload($category))
            ->assertCreated()
            ->assertJsonPath('data.title', 'Sample Phnom Penh Phone');

        $product = Product::firstOrFail();
        $this->actingAs($seller)->patchJson('/api/products/'.$product->id, ['title' => 'Updated Phone Listing'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Updated Phone Listing');

        $seller->forceFill(['premium_status' => 'EXPIRED'])->save();
        $this->actingAs($seller)->deleteJson('/api/products/'.$product->id)->assertOk();
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_premium_users_can_upload_product_images_and_cannot_edit_other_sellers_products(): void
    {
        Storage::fake('public');
        $seller = $this->makeUser([
            'membership' => 'PREMIUM',
            'premium_status' => 'ACTIVE',
            'premium_end_date' => now()->addMonth(),
        ]);
        $otherSeller = $this->makeUser([
            'membership' => 'PREMIUM',
            'premium_status' => 'ACTIVE',
            'premium_end_date' => now()->addMonth(),
        ]);
        $product = Product::create([
            'seller_id' => $otherSeller->id,
            'category_id' => Category::create(['name' => 'Cars', 'slug' => 'cars'])->id,
            'title' => 'Other Seller Vehicle',
            'slug' => 'other-seller-vehicle',
            'description' => 'Vehicle listing for ownership enforcement test.',
            'price' => 9000,
            'condition' => 'Good',
            'province' => 'Phnom Penh',
        ]);

        $response = $this->actingAs($seller)->postJson('/api/products', [
            ...$this->productPayload(Category::create(['name' => 'Fashion', 'slug' => 'fashion'])),
            'images' => [UploadedFile::fake()->image('listing.webp', 300, 300)],
        ])->assertCreated();

        $path = $response->json('data.images.0.path');
        $this->assertStringStartsWith('products/2/', $path);
        Storage::disk('public')->assertExists($path);
        $this->actingAs($seller)->patchJson('/api/products/'.$product->id, ['title' => 'Unauthorized change'])
            ->assertForbidden();
        $this->assertDatabaseHas('products', ['id' => $product->id, 'title' => 'Other Seller Vehicle']);
    }

    public function test_demo_checkout_activates_membership_and_admin_routes_require_admin_role(): void
    {
        $user = $this->makeUser();
        $this->actingAs($user)->postJson('/api/premium/checkout', ['payment_method' => 'ABA_PAY'])
            ->assertOk()
            ->assertJsonPath('simulated', true)
            ->assertJsonPath('user.membership', 'PREMIUM');
        $this->assertTrue($user->fresh()->hasActivePremium());

        $this->actingAs($user)->getJson('/api/admin/dashboard')->assertForbidden();
        $admin = $this->makeUser(['role' => 'ADMIN']);
        $this->actingAs($admin)->getJson('/api/admin/dashboard')->assertOk();
    }

    public function test_login_session_persists_and_logout_invalidates_it(): void
    {
        $user = $this->makeUser();

        $this->withHeader('Origin', 'http://localhost:3000')
            ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password123'])
            ->assertOk();
        $this->withHeader('Origin', 'http://localhost:3000')
            ->getJson('/api/auth/me')->assertOk()->assertJsonPath('user.id', $user->id);
        $this->withHeader('Origin', 'http://localhost:3000')->postJson('/api/auth/logout')->assertOk();
        $this->app['auth']->forgetGuards();
        $this->withHeader('Origin', 'http://localhost:3000')->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_database_seeders_create_a_reusable_cambodia_marketplace_catalog(): void
    {
        $this->seed();

        $this->assertDatabaseCount('categories', 15);
        $this->assertDatabaseCount('locations', 25);
        $this->assertDatabaseCount('products', 3);
        $this->assertTrue(User::where('email', 'seller@khmarket.com')->firstOrFail()->hasActivePremium());
        $this->assertSame('ADMIN', User::where('email', 'admin@khmarket.com')->value('role'));
    }

    private function makeUser(array $attributes = []): User
    {
        static $number = 0;
        $number++;

        return User::create(array_merge([
            'name' => 'Test Member '.$number,
            'username' => 'test_member_'.$number,
            'email' => 'member'.$number.'@example.test',
            'password' => Hash::make('password123'),
            'role' => 'USER',
            'membership' => 'FREE',
            'premium_status' => 'NONE',
        ], $attributes));
    }

    private function productPayload(?Category $category = null): array
    {
        $category ??= Category::create(['name' => 'Phones & Tablets', 'slug' => 'phones-tablets']);

        return [
            'title' => 'Sample Phnom Penh Phone',
            'description' => 'A clean, tested phone listing for marketplace API tests.',
            'price' => 250,
            'category_id' => $category->id,
            'province' => 'Phnom Penh',
            'district' => 'Daun Penh',
            'condition' => 'Good',
        ];
    }
}
