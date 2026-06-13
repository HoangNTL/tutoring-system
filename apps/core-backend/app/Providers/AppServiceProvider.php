<?php

namespace App\Providers;

use App\Contracts\Legacy\LegacyApiClient;
use App\Services\External\CachedLegacyApiProxy;
use App\Services\External\LegacyApiService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\TutorialPeriodPublished;
use App\Listeners\SendTutorialPeriodNotification;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LegacyApiClient::class, function ($app): LegacyApiClient {
            return new CachedLegacyApiProxy(
                $app->make(LegacyApiService::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request): Limit {
            $username = (string) $request->input('username', '');

            return Limit::perMinute(5)->by($username . '|' . $request->ip());
        });

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
