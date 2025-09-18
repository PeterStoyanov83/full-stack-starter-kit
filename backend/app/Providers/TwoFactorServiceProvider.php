<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\TwoFactor\TwoFactorManager;
use App\Services\TwoFactor\GoogleAuthenticatorService;
use App\Services\TwoFactor\EmailService;
use App\Services\TwoFactor\TelegramService;

class TwoFactorServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register the 2FA services
        $this->app->singleton(GoogleAuthenticatorService::class, function ($app) {
            return new GoogleAuthenticatorService();
        });

        $this->app->singleton(EmailService::class, function ($app) {
            return new EmailService();
        });

        $this->app->singleton(TelegramService::class, function ($app) {
            return new TelegramService();
        });

        // Register the 2FA manager with its dependencies
        $this->app->singleton(TwoFactorManager::class, function ($app) {
            return new TwoFactorManager(
                $app->make(GoogleAuthenticatorService::class),
                $app->make(EmailService::class),
                $app->make(TelegramService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
