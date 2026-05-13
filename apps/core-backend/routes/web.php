<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\TutorialPeriodController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestController;

Route::get('/', function () {
    return view('welcome');
});


Route::prefix('api/v1')->group(function () {
    Route::get('/test', [TestController::class, 'index']);
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/tutorial-periods', [TutorialPeriodController::class, 'index']);
        Route::get('/tutorial-periods/{id}', [TutorialPeriodController::class, 'show']);
        Route::post('/tutorial-periods', [TutorialPeriodController::class, 'store']);
        Route::put('/tutorial-periods/{id}', [TutorialPeriodController::class, 'update']);
        Route::delete('/tutorial-periods/{id}', [TutorialPeriodController::class, 'destroy']);
        Route::patch('/tutorial-periods/{id}/open', [TutorialPeriodController::class, 'open']);
        Route::patch('/tutorial-periods/{id}/assigning', [TutorialPeriodController::class, 'assigning']);
        Route::patch('/tutorial-periods/{id}/ongoing', [TutorialPeriodController::class, 'ongoing']);
        Route::patch('/tutorial-periods/{id}/close', [TutorialPeriodController::class, 'close']);
    });
});
