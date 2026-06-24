<?php

namespace Database\Factories;

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationGrant;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<VacationGrant> */
class VacationGrantFactory extends Factory
{
    protected $model = VacationGrant::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-1 year', 'now');
        $daysUsed = fake()->numberBetween(5, 15);
        $end = (clone $start)->modify("+{$daysUsed} days");

        return [
            'user_id' => User::factory(),
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'days_used' => $daysUsed,
        ];
    }
}
