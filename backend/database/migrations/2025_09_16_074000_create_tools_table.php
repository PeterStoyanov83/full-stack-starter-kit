<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('link');
            $table->text('description');
            $table->text('documentation')->nullable();
            $table->text('usage_instructions')->nullable();
            $table->text('examples')->nullable();
            $table->json('images')->nullable(); // Store array of image paths
            $table->unsignedBigInteger('category_id')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Creator of the tool
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes for performance
            $table->index(['name', 'is_active']);
            $table->index('category_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
