<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = Carbon::now()->addDays($this->faker->numberBetween(-30, 90))
            ->setTime($this->faker->numberBetween(17, 22), [0, 15, 30, 45][rand(0, 3)]);

        $end   = (clone $start)->addHours($this->faker->numberBetween(1, 4));

        return [
            'user_id' => User::factory()->artist(),
            'title' => $this->faker->city() . ' Live',
            'venue' => $this->faker->company() . ' Hall',
            'city' => $this->faker->city(),
            'starts_at' => $start,
            'ends_at' => $end,
            'capacity' => $this->faker->optional()->numberBetween(50, 5000),
            'description' => $this->faker->optional()->paragraph(),
        ];
    }

    public function past(): static
    {
        return $this->state(function () {
            $start = now()->subDays(rand(10, 120))->setTime(rand(18, 22), 0);
            return [
                'starts_at' => $start,
                'ends_at' => (clone $start)->addHours(rand(1, 3)),
            ];
        });
    }

    public function upcoming(): static
    {
        return $this->state(function () {
            $start = now()->addDays(rand(1, 120))->setTime(rand(18, 22), 0);
            return [
                'starts_at' => $start,
                'ends_at' => (clone $start)->addHours(rand(1, 3)),
            ];
        });
    }
}
