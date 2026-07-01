<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\Song;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Song>
 */
class SongFactory extends Factory
{
    protected $model = Song::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'album_id' => Album::factory(),
            'title'  => $this->faker->sentence(3),
            'track_number' => $this->faker->numberBetween(1, 15),
            'duration_seconds' => $this->faker->numberBetween(90, 360),
        ];
    }

    public function track(int $n): static
    {
        return $this->state(fn() => ['track_number' => $n]);
    }

    public function duration(int $seconds): static
    {
        return $this->state(fn() => ['duration_seconds' => $seconds]);
    }
}
