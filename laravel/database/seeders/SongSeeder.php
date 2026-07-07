<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Song;
use Illuminate\Database\Seeder;

class SongSeeder extends Seeder
{
    public function run(): void
    {
        $tracklists = [
            'AM' => [
                "Do I Wanna Know?",
                "R U Mine?",
                "One for the Road",
                "Arabella",
                "I Want It All",
                "No.1 Party Anthem",
                "Mad Sounds",
                "Fireside",
                "Why'd You Only Call Me When You're High?",
                "Snap Out of It",
                "Knee Socks",
                "I Wanna Be Yours",
            ],
            'Future Nostalgia' => [
                "Future Nostalgia",
                "Don't Start Now",
                "Cool",
                "Physical",
                "Levitating",
                "Pretty Please",
                "Hallucinate",
                "Love Again",
                "Break My Heart",
                "Good in Bed",
                "Boys Will Be Boys",
            ],
            "don't smile at me" => [
                "Copycat",
                "Idontwannabeyouanymore",
                "My Boy",
                "Watch",
                "Party Favor",
                "Bellyache",
                "Ocean Eyes",
                "Hostage",
            ],
        ];

        foreach ($tracklists as $albumTitle => $tracks) {
            $album = Album::query()->where('title', $albumTitle)->first();

            if (!$album) {
                $this->command?->warn("Album '$albumTitle' not found, skipping songs.");
                continue;
            }

            // kreiramo sve pesme sa jedinstvenim track_number
            foreach ($tracks as $i => $title) {
                Song::query()->updateOrCreate(
                    ['album_id' => $album->id, 'track_number' => $i + 1],
                    [
                        'title' => $title,
                        'duration_seconds' => rand(150, 300),
                    ]
                );
            }
        }
    }
}
