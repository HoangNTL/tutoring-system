<?php

namespace App\Providers;

use App\Contracts\LegacyDataGateway;
use App\Services\External\CachedLegacyDataGateway;
use App\Services\External\NullLegacyDataGateway;
use App\Services\External\LegacyApiService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LegacyDataGateway::class, function ($app): LegacyDataGateway {
            $config = config('services.legacy_service');
            $useNull = empty($config['base_url']) || empty($config['api_key']);

            $inner = $useNull
                ? $app->make(NullLegacyDataGateway::class)
                : $app->make(LegacyApiService::class);

            return new CachedLegacyDataGateway(
                $inner,
                $app->make('cache.store')
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
