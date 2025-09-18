<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class AuthenticationTest extends TestCase
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
            'email_verified_at' => now(),
        ]);
    }

    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'user' => [
                         'id',
                         'name',
                         'email',
                         'role'
                     ],
                     'token'
                 ]);
    }

    /** @test */
    public function user_cannot_login_with_invalid_email()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'wrong@example.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function user_cannot_login_with_invalid_password()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function login_validates_required_fields()
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'password']);
    }

    /** @test */
    public function login_validates_email_format()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'invalid-email',
            'password' => 'password123'
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function authenticated_user_can_logout()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Успешен изход от системата']);

        // Verify token is deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $this->user->id,
            'tokenable_type' => User::class
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_logout()
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_get_profile()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'id',
                     'name',
                     'email',
                     'role',
                     'email_verified_at',
                     'created_at',
                     'updated_at'
                 ])
                 ->assertJson([
                     'id' => $this->user->id,
                     'name' => $this->user->name,
                     'email' => $this->user->email,
                     'role' => $this->user->role
                 ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_get_profile()
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_access_dashboard()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'greeting',
                     'user' => [
                         'id',
                         'name',
                         'email',
                         'role',
                         'role_display'
                     ],
                     'current_time',
                     'permissions'
                 ]);
    }

    /** @test */
    public function dashboard_shows_role_specific_greeting()
    {
        $frontendUser = User::factory()->create(['role' => 'frontend']);
        Sanctum::actingAs($frontendUser, ['*']);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200);
        $responseData = $response->json();
        $this->assertStringContainsString('Frontend разработчик', $responseData['greeting']);
    }

    /** @test */
    public function owner_gets_special_dashboard_access()
    {
        $owner = User::factory()->create(['role' => 'owner']);
        Sanctum::actingAs($owner, ['*']);

        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(200);
        $responseData = $response->json();
        $this->assertStringContainsString('Owner', $responseData['greeting']);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_dashboard()
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(401);
    }

    /** @test */
    public function system_status_endpoint_is_publicly_accessible()
    {
        $response = $this->getJson('/api/status');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'timestamp',
                     'version',
                     'environment',
                     'services',
                     'endpoints'
                 ]);
    }

    /** @test */
    public function redis_stats_are_publicly_accessible()
    {
        $response = $this->getJson('/api/redis/stats');

        $response->assertStatus(200);
    }

    /** @test */
    public function authenticated_user_can_get_redis_stats()
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/redis/stats');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'version',
                     'uptime_seconds',
                     'uptime_human',
                     'connected_clients',
                     'used_memory_human',
                     'used_memory_peak_human',
                     'total_commands_processed',
                     'instantaneous_ops_per_sec',
                     'timestamp'
                 ]);
    }

    /** @test */
    public function multiple_login_attempts_create_separate_tokens()
    {
        // First login
        $response1 = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        // Second login (different session)
        $response2 = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        $response1->assertStatus(200);
        $response2->assertStatus(200);

        $token1 = $response1->json('token');
        $token2 = $response2->json('token');

        $this->assertNotEquals($token1, $token2);
    }

    /** @test */
    public function token_works_for_authenticated_endpoints()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        $token = $response->json('token');

        $authenticatedResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->getJson('/api/user');

        $authenticatedResponse->assertStatus(200);
    }
}