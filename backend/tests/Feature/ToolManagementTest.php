<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tool;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ToolManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->owner = User::factory()->create(['role' => 'owner']);
        $this->frontend = User::factory()->create(['role' => 'frontend']);
        $this->backend = User::factory()->create(['role' => 'backend']);

        // Create test data
        $this->category = Category::factory()->create([
            'name' => 'Test Category',
            'description' => 'A test category'
        ]);

        $this->tag = Tag::factory()->create([
            'name' => 'Test Tag',
            'slug' => 'test-tag'
        ]);

        $this->tool = Tool::factory()->create([
            'user_id' => $this->frontend->id,
            'category_id' => $this->category->id,
            'name' => 'Test Tool',
            'link' => 'https://example.com',
            'description' => 'A test tool'
        ]);

        $this->tool->tags()->attach($this->tag);
    }

    /** @test */
    public function authenticated_user_can_get_tools_list()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->getJson('/api/tools');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'link',
                             'description',
                             'category',
                             'tags',
                             'creator',
                             'is_active',
                             'created_at',
                             'updated_at'
                         ]
                     ],
                     'current_page',
                     'per_page',
                     'total'
                 ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_get_tools_list()
    {
        $response = $this->getJson('/api/tools');

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_user_can_create_tool()
    {
        Sanctum::actingAs($this->backend, ['*']);

        $toolData = [
            'name' => 'New AI Tool',
            'link' => 'https://newtool.com',
            'description' => 'An amazing new AI tool',
            'category_id' => $this->category->id,
            'tag_ids' => [$this->tag->id],
            'documentation' => 'https://docs.newtool.com',
            'usage_instructions' => 'Just click and use',
            'examples' => 'Example usage here'
        ];

        $response = $this->postJson('/api/tools', $toolData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'tool' => [
                         'id',
                         'name',
                         'link',
                         'description',
                         'category',
                         'tags',
                         'creator'
                     ]
                 ]);

        $this->assertDatabaseHas('tools', [
            'name' => 'New AI Tool',
            'link' => 'https://newtool.com',
            'user_id' => $this->backend->id,
            'category_id' => $this->category->id
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_create_tool()
    {
        $toolData = [
            'name' => 'Unauthorized Tool',
            'link' => 'https://unauthorized.com',
            'description' => 'This should fail',
            'category_id' => $this->category->id
        ];

        $response = $this->postJson('/api/tools', $toolData);

        $response->assertStatus(401);
    }

    /** @test */
    public function tool_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->postJson('/api/tools', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'link', 'description']);
    }

    /** @test */
    public function tool_creation_validates_url_format()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $toolData = [
            'name' => 'Test Tool',
            'link' => 'clearly invalid url with spaces',
            'description' => 'Test description',
            'category_id' => $this->category->id
        ];

        $response = $this->postJson('/api/tools', $toolData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['link']);
    }

    /** @test */
    public function tool_creation_validates_category_exists()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $toolData = [
            'name' => 'Test Tool',
            'link' => 'https://example.com',
            'description' => 'Test description',
            'category_id' => 99999 // Non-existent category
        ];

        $response = $this->postJson('/api/tools', $toolData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['category_id']);
    }

    /** @test */
    public function authenticated_user_can_view_tool_details()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->getJson("/api/tools/{$this->tool->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'id',
                     'name',
                     'link',
                     'description',
                     'documentation',
                     'usage_instructions',
                     'examples',
                     'category',
                     'tags',
                     'creator',
                     'is_active',
                     'created_at',
                     'updated_at'
                 ]);
    }

    /** @test */
    public function creator_can_update_own_tool()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $updateData = [
            'name' => 'Updated Tool Name',
            'description' => 'Updated description',
            'link' => 'https://updated.com',
            'category_id' => $this->category->id
        ];

        $response = $this->putJson("/api/tools/{$this->tool->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'tool'
                 ]);

        $this->assertDatabaseHas('tools', [
            'id' => $this->tool->id,
            'name' => 'Updated Tool Name',
            'description' => 'Updated description'
        ]);
    }

    /** @test */
    public function owner_can_update_any_tool()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $updateData = [
            'name' => 'Owner Updated Tool',
            'category_id' => $this->category->id
        ];

        $response = $this->putJson("/api/tools/{$this->tool->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tools', [
            'id' => $this->tool->id,
            'name' => 'Owner Updated Tool'
        ]);
    }

    /** @test */
    public function non_creator_non_owner_cannot_update_tool()
    {
        Sanctum::actingAs($this->backend, ['*']);

        $updateData = [
            'name' => 'Unauthorized Update',
            'category_id' => $this->category->id
        ];

        $response = $this->putJson("/api/tools/{$this->tool->id}", $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function creator_can_delete_own_tool()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->deleteJson("/api/tools/{$this->tool->id}");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Инструментът е изтрит успешно']);

        $this->assertDatabaseMissing('tools', ['id' => $this->tool->id]);
    }

    /** @test */
    public function owner_can_delete_any_tool()
    {
        Sanctum::actingAs($this->owner, ['*']);

        $response = $this->deleteJson("/api/tools/{$this->tool->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('tools', ['id' => $this->tool->id]);
    }

    /** @test */
    public function non_creator_non_owner_cannot_delete_tool()
    {
        Sanctum::actingAs($this->backend, ['*']);

        $response = $this->deleteJson("/api/tools/{$this->tool->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('tools', ['id' => $this->tool->id]);
    }

    /** @test */
    public function tools_can_be_filtered_by_category()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->getJson("/api/tools?category_id={$this->category->id}");

        $response->assertStatus(200);

        $tools = $response->json('data');
        foreach ($tools as $tool) {
            $this->assertEquals($this->category->id, $tool['category']['id']);
        }
    }

    /** @test */
    public function tools_can_be_searched_by_name()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->getJson("/api/tools?search=Test");

        $response->assertStatus(200);

        $tools = $response->json('data');
        foreach ($tools as $tool) {
            $this->assertStringContainsString('Test', $tool['name']);
        }
    }

    /** @test */
    public function tools_can_be_filtered_by_tag()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        $response = $this->getJson("/api/tools?tag_ids[]={$this->tag->id}");

        $response->assertStatus(200);

        $tools = $response->json('data');
        foreach ($tools as $tool) {
            $tagIds = collect($tool['tags'])->pluck('id')->toArray();
            $this->assertContains($this->tag->id, $tagIds);
        }
    }

    /** @test */
    public function tools_pagination_works_correctly()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        // Create additional tools
        Tool::factory(15)->create([
            'category_id' => $this->category->id,
            'user_id' => $this->frontend->id
        ]);

        $response = $this->getJson('/api/tools?per_page=5&page=2');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data',
                     'current_page',
                     'per_page',
                     'total',
                     'last_page'
                 ]);

        $this->assertEquals(2, $response->json('current_page'));
        $this->assertEquals(5, $response->json('per_page'));
    }

    /** @test */
    public function inactive_tools_are_not_shown_by_default()
    {
        Sanctum::actingAs($this->frontend, ['*']);

        // Create inactive tool
        $inactiveTool = Tool::factory()->create([
            'user_id' => $this->frontend->id,
            'category_id' => $this->category->id,
            'is_active' => false
        ]);

        $response = $this->getJson('/api/tools');

        $response->assertStatus(200);

        $toolIds = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertNotContains($inactiveTool->id, $toolIds);
    }

    /** @test */
    public function inactive_tools_are_consistently_not_shown()
    {
        Sanctum::actingAs($this->owner, ['*']);

        // Create inactive tool
        $inactiveTool = Tool::factory()->create([
            'user_id' => $this->frontend->id,
            'category_id' => $this->category->id,
            'is_active' => false
        ]);

        $response = $this->getJson('/api/tools');

        $response->assertStatus(200);

        $toolIds = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertNotContains($inactiveTool->id, $toolIds);
    }
}