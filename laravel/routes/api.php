<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\SongController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/albums', [AlbumController::class, 'index']);
Route::get('/albums/{album}', [AlbumController::class, 'show']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

Route::get('/songs', [SongController::class, 'index']);
Route::get('/songs/{song}', [SongController::class, 'show']);

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/users/{id}/role', [AuthController::class, 'updateUserRole']);

    Route::resource('albums', AlbumController::class)
        ->only(['store', 'update', 'destroy']);

    Route::resource('events', EventController::class)
        ->only(['store', 'update', 'destroy']);

    Route::resource('songs', SongController::class)
        ->only(['store', 'update', 'destroy']);
});
