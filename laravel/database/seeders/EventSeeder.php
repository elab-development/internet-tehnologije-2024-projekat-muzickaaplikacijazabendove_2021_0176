<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $artists = User::query()
            ->whereIn('email', [
                'contact@arcticmonkeys.test',
                'team@dualipa.test',
                'hello@billieeilish.test',
            ])->get()->keyBy('email');

        $events = [
            [
                'email' => 'contact@arcticmonkeys.test',
                'items' => [
                    [
                        'title' => 'AM Tour — London',
                        'venue' => 'The O2 Arena',
                        'city' => 'London',
                        'daysFromNow' => 30,
                        'hours' => 2
                    ],
                    [
                        'title' => 'AM Tour — Belgrade',
                        'venue' => 'Štark Arena',
                        'city' => 'Belgrade',
                        'daysFromNow' => 60,
                        'hours' => 2
                    ],
                    [
                        'title' => 'AM Tour — Paris',
                        'venue' => 'Accor Arena',
                        'city' => 'Paris',
                        'daysFromNow' => 90,
                        'hours' => 2
                    ],
                ],
            ],
            [
                'email' => 'team@dualipa.test',
                'items' => [
                    [
                        'title' => 'Future Nostalgia Live — Milan',
                        'venue' => 'Mediolanum Forum',
                        'city' => 'Milan',
                        'daysFromNow' => 25,
                        'hours' => 2
                    ],
                    [
                        'title' => 'Future Nostalgia Live — Berlin',
                        'venue' => 'Mercedes-Benz Arena',
                        'city' => 'Berlin',
                        'daysFromNow' => 55,
                        'hours' => 2
                    ],
                    [
                        'title' => 'Future Nostalgia Live — Madrid',
                        'venue' => 'WiZink Center',
                        'city' => 'Madrid',
                        'daysFromNow' => 85,
                        'hours' => 2
                    ],
                ],
            ],
            [
                'email' => 'hello@billieeilish.test',
                'items' => [
                    [
                        'title' => 'Live — New York',
                        'venue' => 'Madison Square Garden',
                        'city' => 'New York',
                        'daysFromNow' => 20,
                        'hours' => 2
                    ],
                    [
                        'title' => 'Live — LA',
                        'venue' => 'The Kia Forum',
                        'city' => 'Inglewood',
                        'daysFromNow' => 50,
                        'hours' => 2
                    ],
                    [
                        'title' => 'Live — London',
                        'venue' => 'The O2 Arena',
                        'city' => 'London',
                        'daysFromNow' => 80,
                        'hours' => 2
                    ],
                ],
            ],
        ];

        foreach ($events as $group) {
            $artist = $artists[$group['email']] ?? null;
            if (!$artist) {
                $this->command?->warn("Artist {$group['email']} not found — skipping events.");
                continue;
            }

            foreach ($group['items'] as $e) {
                $start = Carbon::now()->addDays($e['daysFromNow'])->setTime(20, 0);
                $end = (clone $start)->addHours($e['hours']);

                Event::query()->updateOrCreate(
                    [
                        'user_id' => $artist->id,
                        'title' => $e['title'],
                        'starts_at' => $start,
                    ],
                    [
                        'venue' => $e['venue'],
                        'city' => $e['city'],
                        'ends_at' => $end,
                        'capacity' => rand(5000, 20000),
                        'description' => null,
                    ]
                );
            }
        }
    }
}
