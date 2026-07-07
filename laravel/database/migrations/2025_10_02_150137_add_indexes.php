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
            $table->index('release_date', 'albums_release_date_idx');
            $table->index(['user_id', 'release_date'], 'albums_user_release_idx');
        });

        Schema::table('songs', function (Blueprint $table) {
            $table->index('title', 'songs_title_idx');
            $table->index(['album_id', 'title'], 'songs_album_title_idx');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->index('starts_at', 'events_starts_at_idx');
            $table->index('city', 'events_city_idx');
            $table->index(['user_id', 'starts_at'], 'events_user_start_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('albums', function (Blueprint $table) {
            $table->dropIndex('albums_release_date_idx');
            $table->dropIndex('albums_user_release_idx');
        });

        Schema::table('songs', function (Blueprint $table) {
            $table->dropIndex('songs_title_idx');
            $table->dropIndex('songs_album_title_idx');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_starts_at_idx');
            $table->dropIndex('events_city_idx');
            $table->dropIndex('events_user_start_idx');
        });
    }
};
