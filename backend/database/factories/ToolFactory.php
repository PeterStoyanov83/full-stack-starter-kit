<?php

namespace Database\Factories;

use App\Models\Tool;
use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tool>
 */
class ToolFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Tool::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tools = [
            ['name' => 'ChatGPT', 'domain' => 'openai.com'],
            ['name' => 'Claude AI', 'domain' => 'anthropic.com'],
            ['name' => 'GitHub Copilot', 'domain' => 'github.com'],
            ['name' => 'Midjourney', 'domain' => 'midjourney.com'],
            ['name' => 'DALL-E', 'domain' => 'openai.com'],
            ['name' => 'Stable Diffusion', 'domain' => 'stability.ai'],
            ['name' => 'Grammarly', 'domain' => 'grammarly.com'],
            ['name' => 'Jasper AI', 'domain' => 'jasper.ai'],
            ['name' => 'Copy.ai', 'domain' => 'copy.ai'],
            ['name' => 'Notion AI', 'domain' => 'notion.so'],
            ['name' => 'Figma AI', 'domain' => 'figma.com'],
            ['name' => 'Canva AI', 'domain' => 'canva.com'],
        ];

        $tool = $this->faker->randomElement($tools);
        $toolName = $tool['name'] . ' ' . $this->faker->randomNumber(2);

        return [
            'name' => $toolName,
            'link' => 'https://' . $tool['domain'] . '/' . Str::slug($toolName),
            'description' => $this->faker->paragraph(3),
            'documentation' => $this->faker->boolean(70) ? 'https://docs.' . $tool['domain'] : null,
            'usage_instructions' => $this->faker->paragraph(2),
            'examples' => $this->faker->paragraph(2),
            'images' => $this->faker->boolean(50) ? [
                'https://via.placeholder.com/800x600',
                'https://via.placeholder.com/600x400'
            ] : null,
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'is_active' => $this->faker->boolean(90), // 90% chance to be active
        ];
    }

    /**
     * Indicate that the tool is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the tool is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the tool belongs to a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Indicate that the tool belongs to a specific category.
     */
    public function inCategory(Category $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category->id,
        ]);
    }
}