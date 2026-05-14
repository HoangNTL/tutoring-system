<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use App\Jobs\AutoTransitionOpenTutorialPeriodsJob;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->call(
            app(AutoTransitionOpenTutorialPeriodsJob::class)->handle(...)
        )->everyMinute();
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,

            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
        ]);

        // Development-only: allow API requests without CSRF tokens while frontend auth is bypassed.
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        $middleware->redirectGuestsTo(fn() => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
        // Ensure API routes return JSON responses for exceptions
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            if ($request->is('api/*')) {
                return true;
            }
            return $request->expectsJson();
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                    'errors'  => null,
                ], 401);
            }
        });

        // Global exception handler for API routes
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {

                $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

                $errors = ($e instanceof \Illuminate\Validation\ValidationException) ? $e->errors() : null;
                if ($errors) $statusCode = 422;

                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'An error occurred',
                    'errors'  => $errors,
                ], $statusCode);
            }
        });
    })->create();
