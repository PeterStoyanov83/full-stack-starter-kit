<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Разработка на код',
                'description' => 'AI инструменти за писане, оптимизиране и debugging на код',
                'color' => '#3B82F6',
                'icon' => '💻',
                'is_active' => true,
            ],
            [
                'name' => 'Дизайн и UI/UX',
                'description' => 'Инструменти за създаване на дизайни, прототипи и потребителски интерфейси',
                'color' => '#8B5CF6',
                'icon' => '🎨',
                'is_active' => true,
            ],
            [
                'name' => 'Текст и съдържание',
                'description' => 'AI асистенти за писане, редактиране и създаване на съдържание',
                'color' => '#10B981',
                'icon' => '✍️',
                'is_active' => true,
            ],
            [
                'name' => 'Анализ на данни',
                'description' => 'Инструменти за обработка, анализ и визуализация на данни',
                'color' => '#F59E0B',
                'icon' => '📊',
                'is_active' => true,
            ],
            [
                'name' => 'Тестване и QA',
                'description' => 'AI инструменти за автоматизирано тестване и осигуряване на качество',
                'color' => '#EF4444',
                'icon' => '🧪',
                'is_active' => true,
            ],
            [
                'name' => 'DevOps и Automation',
                'description' => 'Инструменти за автоматизация на deployment и инфраструктура',
                'color' => '#6366F1',
                'icon' => '⚙️',
                'is_active' => true,
            ],
            [
                'name' => 'Project Management',
                'description' => 'AI асистенти за управление на проекти и екипи',
                'color' => '#14B8A6',
                'icon' => '📋',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
