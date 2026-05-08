<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
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
