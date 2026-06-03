<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LegacyPeriodController;
use App\Http\Controllers\Api\V1\TutorialPeriodController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::middleware('web')->prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/legacy/periods', [LegacyPeriodController::class, 'index']);
        Route::get('/tutorial-periods', [TutorialPeriodController::class, 'index']);
        Route::get('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'show']);
        Route::post('/tutorial-periods', [TutorialPeriodController::class, 'store']);
        Route::patch('/tutorial-periods/{tutorial_period}/open', [TutorialPeriodController::class, 'open']);
        Route::patch('/tutorial-periods/{tutorial_period}/cancel', [TutorialPeriodController::class, 'cancel']);
        Route::put('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'update']);
        Route::patch('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'update']);
        Route::delete('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'destroy']);
    });
});
