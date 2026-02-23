<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\ExternalSessionAuth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| ExternalSessionAuth runs on every request. If ?session_id= is present,
| it validates against the DENR core DB and logs the user in automatically.
|
*/

Route::middleware([ExternalSessionAuth::class])->group(function () {

    // Public landing — redirects to /dashboard if already authenticated
    Route::get('/', [HomeController::class, 'index'])->name('home');

    // Authenticated routes
    Route::middleware(['auth'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::post('/logout', [DashboardController::class, 'logout'])->name('logout');
    });
});
