<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\CacheService;
use Illuminate\Support\Facades\Cache;

class ClearCacheCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:clear-app {--all : Clear all cache} {--categories : Clear categories cache} {--dashboard : Clear dashboard cache}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear application-specific cache data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('all')) {
            $this->info('🧹 Clearing all application cache...');
            Cache::flush();
            $this->info('✅ All cache cleared successfully!');
            return 0;
        }

        if ($this->option('categories')) {
            $this->info('📂 Clearing categories cache...');
            CacheService::clearCategoriesCache();
            $this->info('✅ Categories cache cleared!');
        }

        if ($this->option('dashboard')) {
            $this->info('📊 Clearing dashboard cache...');
            CacheService::clearDashboardCache();
            $this->info('✅ Dashboard cache cleared!');
        }

        // If no specific options, clear tools-related caches
        if (!$this->option('categories') && !$this->option('dashboard')) {
            $this->info('🔧 Clearing tool-related caches...');
            CacheService::clearToolCaches();
            $this->info('✅ Tool caches cleared!');
        }

        // Show current cache stats
        $stats = CacheService::getCacheStats();
        $this->info("🔑 Remaining keys: {$stats['total_keys']}");

        return 0;
    }
}
