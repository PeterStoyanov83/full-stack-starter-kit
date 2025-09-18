<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Category::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            ['name' => 'AI Writing', 'icon' => '✏️', 'color' => '#3B82F6'],
            ['name' => 'Code Generation', 'icon' => '💻', 'color' => '#10B981'],
            ['name' => 'Image Creation', 'icon' => '🎨', 'color' => '#F59E0B'],
            ['name' => 'Data Analysis', 'icon' => '📊', 'color' => '#8B5CF6'],
            ['name' => 'Productivity', 'icon' => '⚡', 'color' => '#EF4444'],
            ['name' => 'Research', 'icon' => '🔍', 'color' => '#06B6D4'],
            ['name' => 'Design', 'icon' => '🎭', 'color' => '#EC4899'],
            ['name' => 'Marketing', 'icon' => '📢', 'color' => '#F97316'],
        ];

        $category = $this->faker->randomElement($categories);

        return [
            'name' => $category['name'] . ' ' . $this->faker->randomNumber(3),
            'description' => $this->faker->sentence(10),
            'icon' => $category['icon'],
            'color' => $category['color'],
            'is_active' => $this->faker->boolean(90), // 90% chance to be active
        ];
    }

    /**
     * Indicate that the category is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}