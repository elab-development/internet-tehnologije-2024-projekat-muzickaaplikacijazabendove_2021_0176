<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


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