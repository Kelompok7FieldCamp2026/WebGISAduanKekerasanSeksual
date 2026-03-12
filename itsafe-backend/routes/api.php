<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::post('/reports', [ReportController::class, 'store']);
Route::get('/reports', [ReportController::class, 'index']);
Route::get('/reports/stats', [ReportController::class, 'stats']);
Route::get('/reports/status/{code}', [ReportController::class, 'checkStatus']);