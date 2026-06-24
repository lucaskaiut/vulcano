<?php

namespace Database\Factories;

use App\Modules\User\Domain\Models\SalaryHistory;
use App\Modules\User\Domain\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SalaryHistory> */
class SalaryHistoryFactory extends Factory
{
    protected $model = SalaryHistory::class;

    public function definition(): array
    {
        $previous = fake()->randomFloat(2, 3000, 15000);
        $increase = fake()->randomFloat(2, 200, 3000);

        return [
            'user_id' => User::factory(),
            'previous_salary' => $previous,
            'new_salary' => $previous + $increase,
            'effective_date' => fake()->date(),
            'notes' => fake()->optional()->sentence(),
            'changed_by_user_id' => User::factory(),
        ];
    }

    public function initial(float $salary = 8500): static
    {
        return $this->state(fn () => [
            'previous_salary' => null,
            'new_salary' => $salary,
            'notes' => 'Salário inicial',
        ]);
    }
}
