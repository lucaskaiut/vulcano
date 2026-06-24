<?php

namespace Database\Factories;

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<VacationBalance> */
class VacationBalanceFactory extends Factory
{
    protected $model = VacationBalance::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'available_days' => 0,
            'accrued_days' => 0,
            'used_days' => 0,
            'additional_days' => 0,
        ];
    }
}
