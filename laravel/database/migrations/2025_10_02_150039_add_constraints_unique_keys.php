<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('albums', function (Blueprint $table) {
            $table->unique(['user_id', 'title'], 'albums_user_title_unique');
        });

        Schema::table('songs', function (Blueprint $table) {
            $table->unique(['album_id', 'track_number'], 'songs_album_track_unique');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->unique(['user_id', 'title', 'starts_at'], 'events_user_title_start_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('albums', function (Blueprint $table) {
            $table->dropUnique('albums_user_title_unique');
        });

        Schema::table('songs', function (Blueprint $table) {
            $table->dropUnique('songs_album_track_unique');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropUnique('events_user_title_start_unique');
        });
    }
};
