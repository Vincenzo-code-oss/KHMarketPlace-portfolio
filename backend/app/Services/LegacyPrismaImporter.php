<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Conversation;
use App\Models\Favorite;
use App\Models\Location;
use App\Models\Message;
use App\Models\NewsletterSubscription;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Report;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PDO;
use RuntimeException;
use Throwable;

class LegacyPrismaImporter
{
    private array $storedPaths = [];

    public function import(PDO $source, string $sourceHash): array
    {
        if (DB::table('legacy_imports')->where('source_hash', $sourceHash)->exists()) {
            throw new RuntimeException('This exact SQLite database has already been imported.');
        }

        try {
            $counts = DB::transaction(function () use ($source, $sourceHash): array {
                $maps = ['users' => [], 'categories' => [], 'products' => [], 'orders' => []];
                $counts = [];

                foreach ($this->rows($source, 'User') as $row) {
                    $sourcePasswordHash = $this->compatiblePasswordHash($row['passwordHash']);
                    $user = User::updateOrCreate(
                        ['email' => strtolower($row['email'])],
                        [
                            'name' => $row['name'],
                            'username' => $row['username'],
                            'password' => Hash::make(Str::random(48)),
                            'phone' => $row['phone'],
                            'province' => $row['province'],
                            'district' => $row['district'],
                            'bio' => $row['bio'],
                            'avatar' => $row['avatar'],
                            'role' => $row['role'],
                            'membership' => $row['membership'],
                            'premium_status' => $row['premiumStatus'],
                            'premium_start_date' => $this->date($row['premiumStartDate']),
                            'premium_end_date' => $this->date($row['premiumEndDate']),
                            'is_verified' => (bool) $row['isVerified'],
                            'created_at' => $this->date($row['createdAt']),
                        ],
                    );
                    if ($sourcePasswordHash) {
                        DB::table('users')->where('id', $user->id)->update(['password' => $sourcePasswordHash]);
                    }
                    $maps['users'][$row['id']] = $user->id;
                }
                $counts['users'] = count($maps['users']);

                foreach ($this->rows($source, 'Category') as $row) {
                    $category = Category::updateOrCreate(
                        ['slug' => $row['slug']],
                        ['name' => $row['name'], 'icon' => $row['icon'], 'created_at' => $this->date($row['createdAt'])],
                    );
                    $maps['categories'][$row['id']] = $category->id;
                }
                $counts['categories'] = count($maps['categories']);

                foreach ($this->rows($source, 'Product') as $row) {
                    $sellerId = $maps['users'][$row['sellerId']] ?? null;
                    $categoryId = $maps['categories'][$row['categoryId']] ?? null;
                    if (! $sellerId || ! $categoryId) {
                        throw new RuntimeException('A legacy product references a missing seller or category.');
                    }

                    $locationId = $row['province']
                        ? Location::where('slug', Str::slug($row['province']))->value('id')
                        : null;
                    $product = Product::updateOrCreate(
                        ['slug' => $row['slug']],
                        [
                            'seller_id' => $sellerId,
                            'category_id' => $categoryId,
                            'location_id' => $locationId,
                            'title' => $row['title'],
                            'description' => $row['description'],
                            'price' => $row['price'],
                            'currency' => $row['currency'],
                            'condition' => $row['condition'],
                            'province' => $row['province'],
                            'district' => $row['district'],
                            'phone' => $row['phone'],
                            'status' => $row['isActive'] ? 'active' : 'paused',
                            'is_featured' => (bool) $row['isFeatured'],
                            'views' => $row['views'],
                            'created_at' => $this->date($row['createdAt']),
                            'updated_at' => $this->date($row['updatedAt']),
                        ],
                    );
                    $maps['products'][$row['id']] = $product->id;
                }
                $counts['products'] = count($maps['products']);

                $counts['product_images'] = $this->importImages($source, $maps['products']);
                $counts['favorites'] = $this->importFavorites($source, $maps);
                $counts['orders'] = $this->importOrders($source, $maps);
                $counts['order_items'] = $this->importOrderItems($source, $maps);
                $counts['messages'] = $this->importMessages($source, $maps);
                $counts['notifications'] = $this->importNotifications($source, $maps['users']);
                $counts['reviews'] = $this->importReviews($source, $maps);
                $counts['reports'] = $this->importReports($source, $maps);
                $counts['newsletter_subscriptions'] = $this->importNewsletters($source);

                DB::table('legacy_imports')->insert([
                    'source_hash' => $sourceHash,
                    'imported_counts' => json_encode($counts, JSON_THROW_ON_ERROR),
                    'imported_at' => now(),
                ]);

                return $counts;
            });
        } catch (Throwable $exception) {
            foreach ($this->storedPaths as $path) {
                Storage::disk('public')->delete($path);
            }
            throw $exception;
        }

        return $counts;
    }

    private function importImages(PDO $source, array $productMap): int
    {
        $count = 0;
        foreach ($this->rows($source, 'ProductImage') as $position => $row) {
            $productId = $productMap[$row['productId']] ?? null;
            if (! $productId) {
                throw new RuntimeException('A legacy product image references a missing product.');
            }

            [$url, $path] = $this->storeLegacyImage($row['url'], $productId);
            ProductImage::firstOrCreate(
                ['product_id' => $productId, 'url' => $url],
                ['path' => $path, 'sort_order' => $position],
            );
            $count++;
        }

        return $count;
    }

    private function storeLegacyImage(string $url, int $productId): array
    {
        if (! str_starts_with($url, 'data:image/')) {
            return [$url, 'legacy/external-'.hash('sha256', $url)];
        }

        if (! preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+\/=\r\n]+)$/', $url, $matches)) {
            throw new RuntimeException('A legacy product image has an invalid data URI.');
        }

        $contents = base64_decode($matches[2], true);
        if ($contents === false || strlen($contents) > 5 * 1024 * 1024) {
            throw new RuntimeException('A legacy product image is invalid or exceeds the 5 MB migration limit.');
        }

        $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
        $path = 'products/'.$productId.'/legacy-'.Str::uuid().'.'.$extension;
        if (! Storage::disk('public')->put($path, $contents)) {
            throw new RuntimeException('Unable to store a legacy product image.');
        }
        $this->storedPaths[] = $path;

        return [Storage::disk('public')->url($path), $path];
    }

    private function importFavorites(PDO $source, array $maps): int
    {
        $count = 0;
        foreach ($this->rows($source, 'Favorite') as $row) {
            $userId = $maps['users'][$row['userId']] ?? null;
            $productId = $maps['products'][$row['productId']] ?? null;
            if (! $userId || ! $productId) {
                throw new RuntimeException('A legacy favorite references a missing user or product.');
            }
            Favorite::firstOrCreate(['user_id' => $userId, 'product_id' => $productId]);
            $count++;
        }

        return $count;
    }

    private function importOrders(PDO $source, array &$maps): int
    {
        $count = 0;
        foreach ($this->rows($source, 'Order') as $row) {
            $buyerId = $maps['users'][$row['buyerId']] ?? null;
            if (! $buyerId) {
                throw new RuntimeException('A legacy order references a missing buyer.');
            }
            $buyer = User::findOrFail($buyerId);
            $createdAt = $this->date($row['createdAt']);
            $order = Order::create([
                'buyer_id' => $buyerId,
                'status' => $row['status'],
                'subtotal' => $row['total'],
                'delivery_fee' => 0,
                'total' => $row['total'],
                'name' => $buyer->name,
                'phone' => $buyer->phone ?: 'Not provided',
                'province' => $buyer->province ?: 'Not provided',
                'district' => $buyer->district ?: 'Not provided',
                'address' => 'Imported legacy order; the source database did not store a delivery address.',
                'payment_method' => 'LEGACY',
                'payment_status' => 'PENDING',
                'created_at' => $createdAt,
            ]);
            $maps['orders'][$row['id']] = $order->id;
            Payment::create([
                'order_id' => $order->id,
                'provider' => 'LEGACY',
                'amount' => $row['total'],
                'status' => 'PENDING',
                'created_at' => $createdAt,
            ]);
            $count++;
        }

        return $count;
    }

    private function importOrderItems(PDO $source, array $maps): int
    {
        $count = 0;
        foreach ($this->rows($source, 'OrderItem') as $row) {
            $orderId = $maps['orders'][$row['orderId']] ?? null;
            $productId = $maps['products'][$row['productId']] ?? null;
            $product = $productId ? Product::find($productId) : null;
            if (! $orderId || ! $product) {
                throw new RuntimeException('A legacy order item references a missing order or product.');
            }
            OrderItem::create([
                'order_id' => $orderId,
                'product_id' => $product->id,
                'seller_id' => $product->seller_id,
                'quantity' => $row['quantity'],
                'price' => $row['price'],
            ]);
            $count++;
        }

        return $count;
    }

    private function importMessages(PDO $source, array $maps): int
    {
        $count = 0;
        foreach ($this->rows($source, 'Message') as $row) {
            $senderId = $maps['users'][$row['senderId']] ?? null;
            $receiverId = $maps['users'][$row['receiverId']] ?? null;
            if (! $senderId || ! $receiverId || $senderId === $receiverId) {
                throw new RuntimeException('A legacy message has invalid conversation participants.');
            }

            $productId = $maps['products'][$row['productId'] ?? ''] ?? null;
            $sender = User::findOrFail($senderId);
            $receiver = User::findOrFail($receiverId);
            if ($sender->role === 'SELLER') {
                [$buyerId, $sellerId] = [$receiverId, $senderId];
            } elseif ($receiver->role === 'SELLER') {
                [$buyerId, $sellerId] = [$senderId, $receiverId];
            } else {
                [$buyerId, $sellerId] = $senderId < $receiverId
                    ? [$senderId, $receiverId]
                    : [$receiverId, $senderId];
            }
            $conversation = Conversation::firstOrCreate([
                'buyer_id' => $buyerId,
                'seller_id' => $sellerId,
                'product_id' => $productId,
            ]);
            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $senderId,
                'content' => $row['content'],
                'created_at' => $this->date($row['createdAt']),
            ]);
            $conversation->touch();
            $count++;
        }

        return $count;
    }

    private function importNotifications(PDO $source, array $userMap): int
    {
        $count = 0;
        foreach ($this->rows($source, 'Notification') as $row) {
            $userId = $userMap[$row['userId']] ?? null;
            if (! $userId) {
                throw new RuntimeException('A legacy notification references a missing user.');
            }
            Notification::create([
                'user_id' => $userId,
                'type' => $row['type'],
                'text' => $row['text'],
                'read_at' => $row['read'] ? $this->date($row['createdAt']) : null,
                'created_at' => $this->date($row['createdAt']),
            ]);
            $count++;
        }

        return $count;
    }

    private function importReviews(PDO $source, array &$maps): int
    {
        $maps['reviews'] = [];
        $count = 0;
        foreach ($this->rows($source, 'Review') as $row) {
            $userId = $maps['users'][$row['userId']] ?? null;
            $productId = $maps['products'][$row['productId']] ?? null;
            if (! $userId || ! $productId) {
                throw new RuntimeException('A legacy review references a missing user or product.');
            }
            $review = Review::updateOrCreate(
                ['user_id' => $userId, 'product_id' => $productId],
                [
                    'rating' => $row['rating'],
                    'comment' => $row['comment'],
                    'created_at' => $this->date($row['createdAt']),
                ],
            );
            $maps['reviews'][$row['id']] = $review->id;
            $count++;
        }

        return $count;
    }

    private function importReports(PDO $source, array $maps): int
    {
        $count = 0;
        foreach ($this->rows($source, 'Report') as $row) {
            $reporterId = $maps['users'][$row['reporterId']] ?? null;
            if (! $reporterId) {
                throw new RuntimeException('A legacy report references a missing reporter.');
            }
            $targetId = match (strtolower($row['targetType'])) {
                'user' => $maps['users'][$row['targetId']] ?? null,
                'review' => $maps['reviews'][$row['targetId']] ?? null,
                default => $maps['products'][$row['targetId']] ?? null,
            };
            if (! $targetId) {
                throw new RuntimeException('A legacy report references a missing or unsupported target.');
            }
            Report::create([
                'reporter_id' => $reporterId,
                'target_type' => $row['targetType'],
                'target_id' => (string) $targetId,
                'reason' => $row['reason'],
                'status' => 'open',
                'created_at' => $this->date($row['createdAt']),
            ]);
            $count++;
        }

        return $count;
    }

    private function importNewsletters(PDO $source): int
    {
        $count = 0;
        foreach ($this->rows($source, 'NewsletterSubscription') as $row) {
            NewsletterSubscription::updateOrCreate(
                ['email' => strtolower($row['email'])],
                [
                    'is_active' => (bool) $row['isActive'],
                    'created_at' => $this->date($row['createdAt']),
                ],
            );
            $count++;
        }

        return $count;
    }

    private function rows(PDO $source, string $table): array
    {
        return $source->query('SELECT * FROM "'.$table.'"')->fetchAll(PDO::FETCH_ASSOC);
    }

    private function date(?string $date): mixed
    {
        return $date ? now()->parse($date) : null;
    }

    private function compatiblePasswordHash(?string $hash): ?string
    {
        if (! $hash) {
            return null;
        }

        if (preg_match('/^\$2[aby]\$\d{2}\$[.\/A-Za-z0-9]{53}$/', $hash) === 1) {
            return str_starts_with($hash, '$2y$') ? $hash : '$2y$'.substr($hash, 4);
        }

        return in_array(password_get_info($hash)['algoName'], ['argon2i', 'argon2id'], true)
            ? $hash
            : null;
    }
}
