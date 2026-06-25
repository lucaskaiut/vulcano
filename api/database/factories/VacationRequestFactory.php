<?php

namespace Database\Factories;

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Enums\VacationRequestStatus;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<VacationRequest> */
class VacationRequestFactory extends Factory
{
    protected $model = VacationRequest::class;

    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('+5 days', '+30 days');

        return [
            'user_id' => User::factory(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $startDate->modify('+10 days')->format('Y-m-d'),
            'requested_days' => 10,
            'justification' => $this->faker->optional()->sentence(),
            'status' => VacationRequestStatus::Pending,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VacationRequestStatus::Approved,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VacationRequestStatus::Rejected,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VacationRequestStatus::Cancelled,
        ]);
    }
}
