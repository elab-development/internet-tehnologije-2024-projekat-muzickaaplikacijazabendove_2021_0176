<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Album>
 */
class AlbumFactory extends Factory
{
    protected $model = Album::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = $this->faker->unique()->sentence(3);

        return [
            'user_id' => User::factory()->artist(),
            'title' => $title,
            'release_date' => $this->faker->optional(0.8)->date(),
            'description' => $this->faker->optional()->paragraph(),
        ];
    }

    public function withSongs(int $count = 8): static
    {
        return $this->has(\App\Models\Song::factory()->count($count), 'songs');
    }
}
