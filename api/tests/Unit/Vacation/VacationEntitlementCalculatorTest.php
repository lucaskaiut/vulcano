<?php

use App\Modules\Vacation\Domain\Support\VacationEntitlementCalculator;
use Carbon\Carbon;

it('calcula 30 dias para período de um ano', function () {
    $days = VacationEntitlementCalculator::calculateEntitledDays(
        Carbon::parse('2024-01-01'),
        Carbon::parse('2024-12-31'),
    );

    expect($days)->toBe(30);
});

it('calcula dias proporcionais para período parcial', function () {
    $days = VacationEntitlementCalculator::calculateEntitledDays(
        Carbon::parse('2024-01-01'),
        Carbon::parse('2024-06-30'),
    );

    expect($days)->toBe(15);
});
