<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\CacheService;

class WarmCacheCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:warm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warm up application cache with frequently accessed data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔥 Warming up application cache...');

        $bar = $this->output->createProgressBar(3);

        // Warm up categories cache
        $this->info('📂 Warming up categories cache...');
        \App\Models\Category::active()
            ->withCount('activeTools')
            ->orderBy('name')
            ->get();
        $bar->advance();

        // Warm up dashboard stats
        $this->info('📊 Warming up dashboard statistics...');
        CacheService::warmUpCaches();
        $bar->advance();

        // Test Redis connection
        $this->info('⚡ Testing Redis connection...');
        $stats = CacheService::getCacheStats();
        $bar->advance();

        $bar->finish();
        $this->newLine(2);

        if ($stats['status'] === 'connected') {
            $this->info('✅ Cache warm-up completed successfully!');
            $this->info("📈 Redis status: {$stats['status']}");
            $this->info("🔑 Total keys cached: {$stats['total_keys']}");
            $this->info("💾 Memory used: {$stats['used_memory_human']}");
            $this->info("⚡ Hit rate: {$stats['hit_rate']}");
        } else {
            $this->error('❌ Redis connection failed!');
            $this->error("Error: {$stats['message']}");
            return 1;
        }

        $this->info('🎉 Cache is ready for optimal performance!');
        return 0;
    }
}
