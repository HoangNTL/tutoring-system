<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\TutorialPeriodController;
use App\Models\TutorialPeriod;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web'])->prefix('v1')->group(function () {
    Route::get('/test', [TestController::class, 'index']);

    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/tutorial-periods', [TutorialPeriodController::class, 'index'])
            ->middleware('can:viewAny,' . TutorialPeriod::class);
        Route::get('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'show'])
            ->middleware('can:view,tutorial_period');
        Route::post('/tutorial-periods', [TutorialPeriodController::class, 'store'])
            ->middleware('can:create,' . TutorialPeriod::class);
        Route::put('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'update'])
            ->middleware('can:update,tutorial_period');
        Route::delete('/tutorial-periods/{tutorial_period}', [TutorialPeriodController::class, 'destroy'])
            ->middleware('can:delete,tutorial_period');
        Route::patch('/tutorial-periods/{tutorial_period}/open', [TutorialPeriodController::class, 'open'])
            ->middleware('can:update,tutorial_period');
        Route::patch('/tutorial-periods/{tutorial_period}/assigning', [TutorialPeriodController::class, 'assigning'])
            ->middleware('can:update,tutorial_period');
        Route::patch('/tutorial-periods/{tutorial_period}/ongoing', [TutorialPeriodController::class, 'ongoing'])
            ->middleware('can:update,tutorial_period');
        Route::patch('/tutorial-periods/{tutorial_period}/close', [TutorialPeriodController::class, 'close'])
            ->middleware('can:update,tutorial_period');
    });
});
