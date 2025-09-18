<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TwoFactorAuth;
use App\Services\TwoFactor\TwoFactorManager;
use App\Services\ActivityLogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class TwoFactorAuthTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'role' => 'frontend',
            'profile_status' => 'inactive',
            'email_verified_at' => now(),
        ]);

        $this->owner = User::factory()->create([
            'name' => 'Owner User',
            'email' => 'owner@example.com',
            'password' => Hash::make('password123'),
            'role' => 'owner',
            'profile_status' => 'active',
            'email_verified_at' => now(),
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_2fa_endpoints()
    {
        $response = $this->getJson('/api/2fa/status');
        $response->assertStatus(401);

        $response = $this->getJson('/api/2fa/methods');
        $response->assertStatus(401);

        $response = $this->postJson('/api/2fa/setup');
        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_get_2fa_status()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/2fa/status');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'is_enabled',
                     'enabled_methods',
                     'available_methods'
                 ])
                 ->assertJson([
                     'is_enabled' => false,
                     'enabled_methods' => []
                 ]);
    }

    /** @test */
    public function user_can_get_available_2fa_methods()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/2fa/methods');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'methods' => [
                         '*' => [
                             'method',
                             'name',
                             'description',
                             'icon'
                         ]
                     ]
                 ]);
    }

    /** @test */
    public function user_can_setup_google_authenticator()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/2fa/setup', [
            'method' => 'google_authenticator'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'secret_key',
                         'qr_code_url',
                         'manual_entry_key'
                     ]
                 ]);

        // Verify 2FA record was created
        $this->assertDatabaseHas('two_factor_auths', [
            'user_id' => $this->user->id,
            'method' => 'google_authenticator',
            'is_enabled' => false
        ]);
    }

    /** @test */
    public function setup_validates_method_parameter()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/2fa/setup', []);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['method']);

        $response = $this->postJson('/api/2fa/setup', [
            'method' => 'invalid_method'
        ]);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['method']);
    }

    /** @test */
    public function user_can_verify_and_enable_2fa()
    {
        Sanctum::actingAs($this->user, ['*']);

        // First setup 2FA
        $setupResponse = $this->postJson('/api/2fa/setup', [
            'method' => 'google_authenticator'
        ]);
        $setupResponse->assertStatus(200);

        $twoFactorAuth = TwoFactorAuth::where('user_id', $this->user->id)->first();
        $this->assertNotNull($twoFactorAuth);

        // Mock the verification code validation
        $this->mock(TwoFactorManager::class, function ($mock) {
            $mock->shouldReceive('enable')
                 ->once()
                 ->andReturn(true);
        });

        $response = $this->postJson('/api/2fa/verify', [
            'code' => '123456',
            'method' => 'google_authenticator'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'verified' => true,
                     'enabled' => true
                 ]);
    }

    /** @test */
    public function verify_validates_required_code()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/2fa/verify', []);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['code']);

        $response = $this->postJson('/api/2fa/verify', [
            'code' => '12345' // Too short
        ]);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['code']);
    }

    /** @test */
    public function verify_fails_with_invalid_code()
    {
        Sanctum::actingAs($this->user, ['*']);

        // Setup 2FA first
        $this->postJson('/api/2fa/setup', [
            'method' => 'google_authenticator'
        ]);

        // Mock failed verification
        $this->mock(TwoFactorManager::class, function ($mock) {
            $mock->shouldReceive('enable')
                 ->once()
                 ->andReturn(false);
        });

        $response = $this->postJson('/api/2fa/verify', [
            'code' => '000000',
            'method' => 'google_authenticator'
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'verified' => false
                 ]);
    }

    /** @test */
    public function user_profile_activates_after_first_2fa_setup()
    {
        Sanctum::actingAs($this->user, ['*']);

        $this->assertEquals('inactive', $this->user->profile_status);

        // Setup and verify 2FA
        $this->postJson('/api/2fa/setup', [
            'method' => 'google_authenticator'
        ]);

        // Mock successful verification
        $this->mock(TwoFactorManager::class, function ($mock) {
            $mock->shouldReceive('enable')
                 ->once()
                 ->andReturn(true);
        });

        $response = $this->postJson('/api/2fa/verify', [
            'code' => '123456',
            'method' => 'google_authenticator'
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('profile_activated', true);

        // Verify user profile was activated
        $this->user->refresh();
        $this->assertEquals('active', $this->user->profile_status);
    }

    /** @test */
    public function user_can_disable_2fa()
    {
        Sanctum::actingAs($this->user, ['*']);

        // Create enabled 2FA record
        $twoFactorAuth = TwoFactorAuth::factory()->create([
            'user_id' => $this->user->id,
            'method' => 'google_authenticator',
            'is_enabled' => true
        ]);

        // Mock the disable method
        $this->mock(TwoFactorManager::class, function ($mock) {
            $mock->shouldReceive('disable')
                 ->once()
                 ->andReturn(true);
        });

        $response = $this->postJson('/api/2fa/disable', [
            'method' => 'google_authenticator'
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Двуфакторната автентикация е деактивирана');
    }

    /** @test */
    public function disable_validates_method_parameter()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/2fa/disable', []);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['method']);
    }

    /** @test */
    public function user_can_send_verification_code()
    {
        Sanctum::actingAs($this->user, ['*']);

        // Mock the send method
        $this->mock(TwoFactorManager::class, function ($mock) {
            $mock->shouldReceive('sendVerificationCode')
                 ->once()
                 ->andReturn(true);
        });

        $response = $this->postJson('/api/2fa/send-code', [
            'method' => 'google_authenticator'
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Кодът за потвърждение е изпратен');
    }

    /** @test */
    public function user_can_get_qr_code_for_google_authenticator()
    {
        Sanctum::actingAs($this->user, ['*']);

        // Create 2FA record first
        $twoFactorAuth = TwoFactorAuth::factory()->create([
            'user_id' => $this->user->id,
            'method' => 'google_authenticator',
            'is_enabled' => false
        ]);

        $response = $this->getJson('/api/2fa/qr-code');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'qr_code_url',
                     'manual_entry_key'
                 ]);
    }

    /** @test */
    public function qr_code_fails_without_google_authenticator_setup()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/2fa/qr-code');

        $response->assertStatus(404)
                 ->assertJsonPath('message', 'Google Authenticator не е настроен');
    }

    /** @test */
    public function user_can_generate_backup_codes()
    {
        Sanctum::actingAs($this->user, ['*']);

        // Create enabled 2FA record
        $twoFactorAuth = TwoFactorAuth::factory()->create([
            'user_id' => $this->user->id,
            'method' => 'google_authenticator',
            'is_enabled' => true
        ]);

        $response = $this->postJson('/api/2fa/backup-codes', [
            'method' => 'google_authenticator'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'backup_codes'
                 ]);
    }

    /** @test */
    public function backup_codes_fail_without_2fa_setup()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/2fa/backup-codes', [
            'method' => 'google_authenticator'
        ]);

        $response->assertStatus(404)
                 ->assertJsonPath('message', 'Двуфакторната автентикация не е настроена за този метод');
    }

    /** @test */
    public function user_can_get_setup_instructions()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/2fa/instructions', [
            'method' => 'google_authenticator'
        ]);

        $response->assertStatus(200);
        // Instructions content depends on the service implementation
    }

    /** @test */
    public function instructions_validate_method_parameter()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/2fa/instructions', []);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['method']);

        $response = $this->postJson('/api/2fa/instructions', [
            'method' => 'invalid_method'
        ]);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['method']);
    }

    /** @test */
    public function owner_user_with_2fa_enabled_shows_correct_status()
    {
        Sanctum::actingAs($this->owner, ['*']);

        // Create enabled 2FA for owner
        TwoFactorAuth::factory()->create([
            'user_id' => $this->owner->id,
            'method' => 'google_authenticator',
            'is_enabled' => true,
            'last_used_at' => now()
        ]);

        $response = $this->getJson('/api/2fa/status');

        $response->assertStatus(200)
                 ->assertJson([
                     'is_enabled' => true
                 ])
                 ->assertJsonCount(1, 'enabled_methods')
                 ->assertJsonPath('enabled_methods.0.method', 'google_authenticator')
                 ->assertJsonPath('enabled_methods.0.is_setup_complete', true);
    }

    /** @test */
    public function multiple_2fa_methods_can_be_enabled()
    {
        Sanctum::actingAs($this->user, ['*']);

        // Create multiple enabled 2FA methods
        TwoFactorAuth::factory()->create([
            'user_id' => $this->user->id,
            'method' => 'google_authenticator',
            'is_enabled' => true
        ]);

        TwoFactorAuth::factory()->create([
            'user_id' => $this->user->id,
            'method' => 'email',
            'is_enabled' => true
        ]);

        $response = $this->getJson('/api/2fa/status');

        $response->assertStatus(200)
                 ->assertJson([
                     'is_enabled' => true
                 ])
                 ->assertJsonCount(2, 'enabled_methods');
    }
}