<?php

namespace Database\Factories;

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Enums\VacationPeriodStatus;
use App\Modules\Vacation\Domain\Models\VacationPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<VacationPeriod> */
class VacationPeriodFactory extends Factory
{
    protected $model = VacationPeriod::class;

    public function definition(): array
    {
        $start = fake()->dateTimeBetween('-2 years', '-1 year');

        return [
            'user_id' => User::factory(),
            'start_date' => $start->format('Y-m-d'),
            'end_date' => null,
            'entitled_days' => null,
            'status' => VacationPeriodStatus::Open,
        ];
    }

    public function closed(string $startDate, string $endDate, int $entitledDays): static
    {
        return $this->state(fn () => [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'entitled_days' => $entitledDays,
            'status' => VacationPeriodStatus::Closed,
        ]);
    }
}
