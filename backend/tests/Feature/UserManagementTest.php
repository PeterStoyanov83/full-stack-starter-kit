<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->owner = User::factory()->create([
            'name' => 'Test Owner',
            'email' => 'owner@test.local',
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        $this->frontend = User::factory()->create([
            'name' => 'Test Frontend',
            'email' => 'frontend@test.local',
            'role' => 'frontend',
            'email_verified_at' => now(),
        ]);
    }

    /** @test */
    public function owner_can_get_users_list()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'email',
                             'role',
                             'is_active',
                             'created_at',
                             'updated_at',
                             'email_verified_at',
                             'tools_count'
                         ]
                     ],
                     'total'
                 ]);
    }

    /** @test */
    public function non_owner_cannot_get_users_list()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->getJson('/api/users');

        $response->assertStatus(403)
                 ->assertJson([
                     'message' => 'Unauthorized. Only owners can manage users.'
                 ]);
    }

    /** @test */
    public function owner_can_create_new_user()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $userData = [
            'name' => 'New Test User',
            'email' => 'newuser@test.local',
            'password' => 'password123',
            'role' => 'backend'
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'user' => [
                         'id',
                         'name',
                         'email',
                         'role',
                         'is_active',
                         'created_at',
                         'updated_at',
                         'email_verified_at',
                         'tools_count'
                     ]
                 ]);

        $this->assertDatabaseHas('users', [
            'name' => 'New Test User',
            'email' => 'newuser@test.local',
            'role' => 'backend'
        ]);
    }

    /** @test */
    public function non_owner_cannot_create_user()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $userData = [
            'name' => 'Unauthorized User',
            'email' => 'unauthorized@test.local',
            'password' => 'password123',
            'role' => 'qa'
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(403);
    }

    /** @test */
    public function user_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $response = $this->postJson('/api/users', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
    }

    /** @test */
    public function user_creation_validates_email_format()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $userData = [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'role' => 'frontend'
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function user_creation_validates_unique_email()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $userData = [
            'name' => 'Duplicate Email User',
            'email' => $this->frontend->email, // Using existing email
            'password' => 'password123',
            'role' => 'designer'
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function user_creation_validates_password_length()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => '123', // Too short
            'role' => 'pm'
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function user_creation_validates_valid_roles()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'role' => 'invalid_role'
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['role']);
    }

    /** @test */
    public function owner_can_update_user()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $updateData = [
            'name' => 'Updated Name',
            'email' => 'updated@test.local',
            'role' => 'qa'
        ];

        $response = $this->putJson("/api/users/{$this->frontend->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'user' => [
                         'id',
                         'name',
                         'email',
                         'role',
                         'is_active',
                         'created_at',
                         'updated_at',
                         'email_verified_at',
                         'tools_count'
                     ]
                 ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->frontend->id,
            'name' => 'Updated Name',
            'email' => 'updated@test.local',
            'role' => 'qa'
        ]);
    }

    /** @test */
    public function owner_can_update_user_password()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $updateData = [
            'name' => $this->frontend->name,
            'email' => $this->frontend->email,
            'role' => $this->frontend->role,
            'password' => 'newpassword123'
        ];

        $response = $this->putJson("/api/users/{$this->frontend->id}", $updateData);

        $response->assertStatus(200);

        // Verify password was updated by attempting login
        $this->frontend->refresh();
        $this->assertTrue(\Hash::check('newpassword123', $this->frontend->password));
    }

    /** @test */
    public function non_owner_cannot_update_user()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $updateData = [
            'name' => 'Unauthorized Update',
            'role' => 'owner'
        ];

        $response = $this->putJson("/api/users/{$this->owner->id}", $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function owner_can_delete_user()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $userToDelete = User::factory()->create([
            'role' => 'designer'
        ]);

        $response = $this->deleteJson("/api/users/{$userToDelete->id}");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'User deleted successfully']);

        $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
    }

    /** @test */
    public function owner_cannot_delete_themselves()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $response = $this->deleteJson("/api/users/{$this->owner->id}");

        $response->assertStatus(422)
                 ->assertJson(['message' => 'You cannot delete your own account.']);

        $this->assertDatabaseHas('users', ['id' => $this->owner->id]);
    }

    /** @test */
    public function owner_cannot_delete_other_owners()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $otherOwner = User::factory()->create(['role' => 'owner']);

        $response = $this->deleteJson("/api/users/{$otherOwner->id}");

        $response->assertStatus(422)
                 ->assertJson(['message' => 'Cannot delete other owner accounts.']);

        $this->assertDatabaseHas('users', ['id' => $otherOwner->id]);
    }

    /** @test */
    public function non_owner_cannot_delete_user()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $userToDelete = User::factory()->create(['role' => 'qa']);

        $response = $this->deleteJson("/api/users/{$userToDelete->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $userToDelete->id]);
    }

    /** @test */
    public function owner_can_get_system_stats()
    {
        Sanctum::actingAs($this->owner, ['*']);

        // Create some test data
        User::factory(3)->create();

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'total_users',
                     'active_users',
                     'total_tools',
                     'active_tools',
                     'tools_this_month',
                     'categories_count',
                     'tags_count'
                 ]);
    }

    /** @test */
    public function non_owner_cannot_get_system_stats()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(403);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_user_endpoints()
    {
        $endpoints = [
            ['GET', '/api/users'],
            ['POST', '/api/users'],
            ['GET', '/api/admin/stats']
        ];

        foreach ($endpoints as [$method, $endpoint]) {
            $response = $this->json($method, $endpoint);
            $response->assertStatus(401);
        }
    }

    /** @test */
    public function user_can_get_own_profile()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->getJson("/api/users/{$this->frontend->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'id',
                     'name',
                     'email',
                     'role',
                     'is_active',
                     'created_at',
                     'updated_at',
                     'email_verified_at',
                     'tools_count'
                 ]);
    }

    /** @test */
    public function user_cannot_get_other_users_profile()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->getJson("/api/users/{$this->owner->id}");

        $response->assertStatus(403);
    }
}