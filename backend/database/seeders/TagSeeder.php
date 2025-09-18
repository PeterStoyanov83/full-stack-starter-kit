<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Free', 'color' => '#10B981'],
            ['name' => 'Paid', 'color' => '#F59E0B'],
            ['name' => 'Open Source', 'color' => '#3B82F6'],
            ['name' => 'API Integration', 'color' => '#8B5CF6'],
            ['name' => 'Browser Extension', 'color' => '#14B8A6'],
            ['name' => 'Desktop App', 'color' => '#6366F1'],
            ['name' => 'Web App', 'color' => '#06B6D4'],
            ['name' => 'Mobile App', 'color' => '#84CC16'],
            ['name' => 'CLI Tool', 'color' => '#64748B'],
            ['name' => 'VS Code Extension', 'color' => '#0EA5E9'],
            ['name' => 'GitHub Integration', 'color' => '#1F2937'],
            ['name' => 'Real-time', 'color' => '#EF4444'],
            ['name' => 'Collaboration', 'color' => '#F97316'],
            ['name' => 'Automation', 'color' => '#A855F7'],
            ['name' => 'AI-Powered', 'color' => '#EC4899'],
            ['name' => 'Beginner Friendly', 'color' => '#22C55E'],
            ['name' => 'Advanced', 'color' => '#DC2626'],
            ['name' => 'Enterprise', 'color' => '#7C3AED'],
        ];

        foreach ($tags as $tag) {
            \App\Models\Tag::firstOrCreate(
                ['name' => $tag['name']],
                $tag
            );
        }
    }
}
