<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

if (!function_exists('transformValidationErrorsToCamelCaseOnce')) {
    function transformValidationErrorsToCamelCaseOnce(array $errors): array
    {
        $normalized = [];

        foreach ($errors as $key => $value) {
            $normalizedKey = is_string($key) ? Str::camel($key) : $key;
            $normalized[$normalizedKey] = is_array($value)
                ? transformValidationErrorsToCamelCaseOnce($value)
                : $value;
        }

        return $normalized;
    }
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
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
                    'data' => null,
                    'meta' => null,
                ], 401);
            }
        });

        // Global exception handler for API routes
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                $errors = ($e instanceof \Illuminate\Validation\ValidationException)
                    ? transformValidationErrorsToCamelCaseOnce($e->errors())
                    : null;
                if ($errors) $statusCode = 422;

                $response = [
                    'success' => false,
                    'message' => $e->getMessage() ?: 'An error occurred',
                    'data' => null,
                    'meta' => null,
                ];

                if ($errors !== null) {
                    $response['errors'] = $errors;
                }

                return response()->json($response, $statusCode);
            }
        });
    })->create();
