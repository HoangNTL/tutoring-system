<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestController;

Route::get('/', function () {
    return view('welcome');
});

// Route::get('/test', [TestController::class, 'index']);

Route::prefix('api/v1')->group(function () {
    Route::get('/test', [TestController::class, 'index']);
});
