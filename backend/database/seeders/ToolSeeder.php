<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tool;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;

class ToolSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get users and categories for tool creation
        $peter = User::where('email', 'peterstoyanov83@gmail.com')->first();
        $elena = User::where('email', 'elena@frontend.dev')->first();
        $marin = User::where('email', 'marin@backend.dev')->first();
        $iva = User::where('email', 'iva@design.studio')->first();
        $stefan = User::where('email', 'stefan@qa.test')->first();

        $codeCategory = Category::where('name', 'Разработка на код')->first();
        $designCategory = Category::where('name', 'Дизайн и UI/UX')->first();
        $contentCategory = Category::where('name', 'Текст и съдържание')->first();
        $dataCategory = Category::where('name', 'Анализ на данни')->first();
        $qaCategory = Category::where('name', 'Тестване и QA')->first();
        $devopsCategory = Category::where('name', 'DevOps и Automation')->first();
        $projectCategory = Category::where('name', 'Project Management')->first();

        // Get some tags
        $freeTag = Tag::where('name', 'Безплатен')->first();
        $premiumTag = Tag::where('name', 'Платен')->first();
        $apiTag = Tag::where('name', 'API')->first();
        $cloudTag = Tag::where('name', 'Облачен')->first();
        $openSourceTag = Tag::where('name', 'Open Source')->first();

        // Comprehensive tool dataset covering all scenarios
        $tools = [
            // APPROVED TOOLS - Created by different users
            [
                'name' => 'ChatGPT',
                'link' => 'https://chat.openai.com',
                'description' => 'Мощен AI чатбот за генериране на текст, код и отговори на въпроси',
                'documentation' => 'Подробна документация за използване на ChatGPT API',
                'usage_instructions' => '1. Отидете на сайта\n2. Регистрирайте се\n3. Започнете чат',
                'examples' => 'Генериране на код, писане на статии, отговори на въпроси',
                'category_id' => $codeCategory?->id,
                'user_id' => $peter->id,
                'status' => 'approved',
                'approved_at' => now()->subDays(5),
                'approved_by' => $peter->id,
                'is_active' => true,
                'tags' => [$premiumTag?->id, $apiTag?->id, $cloudTag?->id],
                'roles' => ['frontend', 'backend']
            ],
            [
                'name' => 'GitHub Copilot',
                'link' => 'https://github.com/features/copilot',
                'description' => 'AI асистент за програмиране, който предлага код директно в редактора',
                'documentation' => 'Интеграция с VS Code, IntelliJ и други IDE',
                'usage_instructions' => 'Инсталирайте разширението във VS Code',
                'examples' => 'Автодопълване на функции, генериране на тестове',
                'category_id' => $codeCategory?->id,
                'user_id' => $marin->id,
                'status' => 'approved',
                'approved_at' => now()->subDays(3),
                'approved_by' => $peter->id,
                'is_active' => true,
                'tags' => [$premiumTag?->id, $apiTag?->id],
                'roles' => ['backend', 'frontend']
            ],
            [
                'name' => 'Figma',
                'link' => 'https://figma.com',
                'description' => 'Професионален инструмент за UI/UX дизайн и прототипиране',
                'documentation' => 'Пълно ръководство за дизайн системи',
                'usage_instructions' => 'Създайте акаунт и започнете нов проект',
                'examples' => 'Дизайн на мобилни приложения, уеб интерфейси',
                'category_id' => $designCategory?->id,
                'user_id' => $iva->id,
                'status' => 'approved',
                'approved_at' => now()->subDays(7),
                'approved_by' => $peter->id,
                'is_active' => true,
                'tags' => [$freeTag?->id, $premiumTag?->id, $cloudTag?->id],
                'roles' => ['designer', 'frontend']
            ],
            [
                'name' => 'Selenium',
                'link' => 'https://selenium.dev',
                'description' => 'Автоматизирано тестване на уеб приложения',
                'documentation' => 'WebDriver документация и примери',
                'usage_instructions' => 'pip install selenium && загледайте примерите',
                'examples' => 'E2E тестове, regression тестване',
                'category_id' => $qaCategory?->id,
                'user_id' => $stefan->id,
                'status' => 'approved',
                'approved_at' => now()->subDays(2),
                'approved_by' => $peter->id,
                'is_active' => true,
                'tags' => [$freeTag?->id, $openSourceTag?->id],
                'roles' => ['qa', 'backend']
            ],

            // PENDING TOOLS - Waiting for approval
            [
                'name' => 'Claude AI',
                'link' => 'https://claude.ai',
                'description' => 'Антропик Claude - AI асистент за анализ, код и писане',
                'documentation' => 'API документация и интеграционни примери',
                'usage_instructions' => 'Регистрирайте се и започнете нов чат',
                'examples' => 'Анализ на документи, генериране на код, технически обзори',
                'category_id' => $codeCategory?->id,
                'user_id' => $elena->id,
                'status' => 'pending',
                'is_active' => true,
                'tags' => [$premiumTag?->id, $apiTag?->id],
                'roles' => ['frontend', 'backend']
            ],
            [
                'name' => 'Midjourney',
                'link' => 'https://midjourney.com',
                'description' => 'AI генератор на изображения от текстови описания',
                'documentation' => 'Промпт инженеринг и стилове',
                'usage_instructions' => 'Присъединете се към Discord сървъра',
                'examples' => 'Концептуални изображения, лога, илюстрации',
                'category_id' => $designCategory?->id,
                'user_id' => $iva->id,
                'status' => 'pending',
                'is_active' => true,
                'tags' => [$premiumTag?->id, $cloudTag?->id],
                'roles' => ['designer']
            ],
            [
                'name' => 'Postman',
                'link' => 'https://postman.com',
                'description' => 'API development и тестване платформа',
                'documentation' => 'Колекции, тестове и мониторинг',
                'usage_instructions' => 'Свалете десктоп приложението',
                'examples' => 'REST API тестване, документация на API',
                'category_id' => $codeCategory?->id,
                'user_id' => $marin->id,
                'status' => 'pending',
                'is_active' => true,
                'tags' => [$freeTag?->id, $premiumTag?->id, $apiTag?->id],
                'roles' => ['backend', 'qa']
            ],

            // REJECTED TOOLS - With rejection reasons
            [
                'name' => 'Random Tool XYZ',
                'link' => 'https://random-tool.example.com',
                'description' => 'Тестов инструмент който няма ясна функционалност',
                'documentation' => 'Липсва документация',
                'usage_instructions' => 'Неясни инструкции',
                'examples' => 'Неконкретни примери',
                'category_id' => $codeCategory?->id,
                'user_id' => $elena->id,
                'status' => 'rejected',
                'rejection_reason' => 'Инструментът няма ясна функционалност и липсва адекватна документация. Линкът не работи правилно.',
                'is_active' => true,
                'tags' => [$freeTag?->id],
                'roles' => ['frontend']
            ],
            [
                'name' => 'Outdated Design Tool',
                'link' => 'https://old-design-tool.com',
                'description' => 'Остарял дизайн инструмент',
                'documentation' => 'Стара документация от 2015',
                'usage_instructions' => 'Изисква Flash Player',
                'examples' => 'Основни фигури и форми',
                'category_id' => $designCategory?->id,
                'user_id' => $iva->id,
                'status' => 'rejected',
                'rejection_reason' => 'Инструментът използва остарели технологии (Flash) и не се поддържа активно. Препоръчваме модерни алтернативи.',
                'is_active' => true,
                'tags' => [$freeTag?->id],
                'roles' => ['designer']
            ],

            // MORE APPROVED TOOLS - Different categories
            [
                'name' => 'Docker',
                'link' => 'https://docker.com',
                'description' => 'Контейнеризация на приложения за всички среди',
                'documentation' => 'Dockerfile reference и best practices',
                'usage_instructions' => 'Инсталирайте Docker Desktop',
                'examples' => 'Microservices, CI/CD, development environments',
                'category_id' => $devopsCategory?->id,
                'user_id' => $marin->id,
                'status' => 'approved',
                'approved_at' => now()->subDays(1),
                'approved_by' => $peter->id,
                'is_active' => true,
                'tags' => [$freeTag?->id, $openSourceTag?->id, $cloudTag?->id],
                'roles' => ['backend', 'qa']
            ],
            [
                'name' => 'Notion',
                'link' => 'https://notion.so',
                'description' => 'All-in-one workspace за документация и управление на проекти',
                'documentation' => 'Templates и automation guide',
                'usage_instructions' => 'Създайте workspace и започнете със template',
                'examples' => 'Wiki, task management, meeting notes',
                'category_id' => $projectCategory?->id,
                'user_id' => $peter->id,
                'status' => 'approved',
                'approved_at' => now()->subHours(6),
                'approved_by' => $peter->id,
                'is_active' => true,
                'tags' => [$freeTag?->id, $premiumTag?->id, $cloudTag?->id],
                'roles' => ['frontend', 'backend', 'designer', 'qa']
            ],
            [
                'name' => 'Google Analytics',
                'link' => 'https://analytics.google.com',
                'description' => 'Уеб анализи и потребителско поведение',
                'documentation' => 'GA4 implementation guide',
                'usage_instructions' => 'Добавете tracking код към сайта',
                'examples' => 'Traffic analysis, conversion tracking, user journeys',
                'category_id' => $dataCategory?->id,
                'user_id' => $elena->id,
                'status' => 'approved',
                'approved_at' => now()->subHours(12),
                'approved_by' => $peter->id,
                'is_active' => true,
                'tags' => [$freeTag?->id, $cloudTag?->id, $apiTag?->id],
                'roles' => ['frontend', 'backend']
            ],

            // MORE PENDING TOOLS
            [
                'name' => 'Tailwind CSS',
                'link' => 'https://tailwindcss.com',
                'description' => 'Utility-first CSS framework за бързо стилизиране',
                'documentation' => 'Complete utility reference',
                'usage_instructions' => 'npm install tailwindcss',
                'examples' => 'Responsive design, dark mode, animations',
                'category_id' => $designCategory?->id,
                'user_id' => $elena->id,
                'status' => 'pending',
                'is_active' => true,
                'tags' => [$freeTag?->id, $openSourceTag?->id],
                'roles' => ['frontend', 'designer']
            ],
            [
                'name' => 'Jest',
                'link' => 'https://jestjs.io',
                'description' => 'JavaScript testing framework с focus на простота',
                'documentation' => 'API reference и testing patterns',
                'usage_instructions' => 'npm install --save-dev jest',
                'examples' => 'Unit tests, mocking, snapshot testing',
                'category_id' => $qaCategory?->id,
                'user_id' => $stefan->id,
                'status' => 'pending',
                'is_active' => true,
                'tags' => [$freeTag?->id, $openSourceTag?->id],
                'roles' => ['frontend', 'qa']
            ],
            [
                'name' => 'Grammarly',
                'link' => 'https://grammarly.com',
                'description' => 'AI асистент за проверка на граматика и стил',
                'documentation' => 'Browser extension и integrations',
                'usage_instructions' => 'Инсталирайте browser extension',
                'examples' => 'Email proofreading, document editing, blog writing',
                'category_id' => $contentCategory?->id,
                'user_id' => $elena->id,
                'status' => 'pending',
                'is_active' => true,
                'tags' => [$freeTag?->id, $premiumTag?->id, $cloudTag?->id],
                'roles' => ['frontend', 'designer']
            ]
        ];

        foreach ($tools as $toolData) {
            $tags = $toolData['tags'] ?? [];
            $roles = $toolData['roles'] ?? [];
            unset($toolData['tags'], $toolData['roles']);

            $tool = Tool::create($toolData);

            // Attach tags
            if (!empty($tags)) {
                $tool->tags()->attach(array_filter($tags));
            }

            // Attach recommended roles/users
            if (!empty($roles)) {
                foreach ($roles as $role) {
                    $users = User::where('role', $role)->get();
                    foreach ($users as $user) {
                        $tool->recommendedUsers()->attach($user->id, [
                            'role_type' => 'recommended_for',
                            'notes' => "Препоръчан за {$role} роля"
                        ]);
                    }
                }
            }
        }

        echo "✅ Created " . count($tools) . " diverse tools with different statuses and categories!\n";
        echo "📊 Breakdown:\n";
        echo "   • Approved: " . collect($tools)->where('status', 'approved')->count() . " tools\n";
        echo "   • Pending: " . collect($tools)->where('status', 'pending')->count() . " tools\n";
        echo "   • Rejected: " . collect($tools)->where('status', 'rejected')->count() . " tools\n";
    }
}