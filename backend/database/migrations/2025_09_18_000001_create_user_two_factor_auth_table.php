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
        Schema::create('user_two_factor_auth', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->enum('method', ['google_authenticator', 'email', 'telegram']);
            $table->boolean('is_enabled')->default(false);
            $table->string('secret_key')->nullable(); // For Google Authenticator TOTP secret
            $table->string('telegram_chat_id')->nullable(); // For Telegram bot integration
            $table->json('backup_codes')->nullable(); // Emergency recovery codes
            $table->timestamp('last_used_at')->nullable(); // Last successful 2FA verification
            $table->integer('failed_attempts')->default(0); // Failed verification attempts
            $table->timestamp('locked_until')->nullable(); // Temporary lockout after too many failures
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'method']); // One record per user per method
            $table->index(['user_id', 'is_enabled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_two_factor_auth');
    }
};