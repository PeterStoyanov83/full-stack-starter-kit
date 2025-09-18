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
        Schema::create('tool_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role_type'); // 'recommended_for' or 'suitable_for'
            $table->text('notes')->nullable(); // Additional notes about why this tool is good for this role
            $table->timestamps();

            // Prevent duplicate entries
            $table->unique(['tool_id', 'user_id', 'role_type']);

            // Indexes for performance
            $table->index('tool_id');
            $table->index('user_id');
            $table->index('role_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_user');
    }
};
