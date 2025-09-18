<?php

namespace Database\Factories;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tag>
 */
class TagFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Tag::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tags = [
            'AI', 'Machine Learning', 'Natural Language', 'Computer Vision', 'Deep Learning',
            'Chatbot', 'Text Generation', 'Image Processing', 'Data Science', 'Automation',
            'API', 'Cloud', 'Open Source', 'Free', 'Premium', 'Enterprise',
            'Beginner', 'Advanced', 'Professional', 'Developer', 'Designer',
            'Content Creation', 'SEO', 'Social Media', 'Email', 'Analytics',
            'Productivity', 'Collaboration', 'Project Management', 'Time Tracking',
            'Security', 'Privacy', 'GDPR', 'Compliance'
        ];

        $colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444',
            '#06B6D4', '#EC4899', '#F97316', '#84CC16', '#6366F1'
        ];

        $name = $this->faker->randomElement($tags) . ' ' . $this->faker->randomNumber(2);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'color' => $this->faker->randomElement($colors),
        ];
    }
}