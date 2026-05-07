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
            $config = config('services.legacy_service');

            return Http::baseUrl($config['base_url'])
                ->withHeaders([
                    'x-api-key' => $config['api_key'],
                    'Accept'    => 'application/json',
                ])
                ->timeout(5);
        });
    }
}
