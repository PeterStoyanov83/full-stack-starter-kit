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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('profile_status', ['inactive', 'active'])->default('inactive')->after('role');
            $table->timestamp('profile_activated_at')->nullable()->after('profile_status');
            $table->boolean('requires_2fa_setup')->default(true)->after('profile_activated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['profile_status', 'profile_activated_at', 'requires_2fa_setup']);
        });
    }
};
