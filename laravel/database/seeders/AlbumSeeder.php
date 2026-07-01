<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class AlbumSeeder extends Seeder
{
    public function run(): void
    {
        $artistByEmail = fn(string $email) => User::query()->where('email', $email)->firstOrFail();

        $data = [
            [
                'artist_email' => 'contact@arcticmonkeys.test',
                'title' => 'AM',
                'release_date' => '2013-09-09',
                'description' => 'Fifth studio album by Arctic Monkeys.',
            ],
            [
                'artist_email' => 'team@dualipa.test',
                'title' => 'Future Nostalgia',
                'release_date' => '2020-03-27',
                'description' => 'Second studio album by Dua Lipa.',
            ],
            [
                'artist_email' => 'hello@billieeilish.test',
                'title' => "don't smile at me",
                'release_date' => '2017-08-11',
                'description' => 'Debut EP by Billie Eilish.',
            ],
        ];

        foreach ($data as $a) {
            $artist = $artistByEmail($a['artist_email']);

            Album::query()->updateOrCreate(
                ['user_id' => $artist->id, 'title' => $a['title']],
                Arr::only($a, ['release_date', 'description']) + ['user_id' => $artist->id]
            );
        }
    }
}
