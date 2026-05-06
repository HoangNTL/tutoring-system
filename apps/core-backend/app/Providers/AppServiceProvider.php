<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Http;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //

        Http::macro('legacy', function () {
            return Http::withHeaders([
                'x-api-key' => config('services.legacy_service.api_key'),
            ])->baseUrl(config('services.legacy_service.base_url'));
        });
    }
}
