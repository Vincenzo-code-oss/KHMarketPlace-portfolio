<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('legacy_imports', function (Blueprint $table): void {
            $table->id();
            $table->char('source_hash', 64)->unique();
            $table->json('imported_counts');
            $table->timestamp('imported_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legacy_imports');
    }
};
