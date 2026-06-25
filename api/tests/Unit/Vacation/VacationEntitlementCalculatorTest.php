<?php

use App\Modules\Vacation\Domain\Support\VacationEntitlementCalculator;

it('calcula dias adquiridos positivos para contratacao no passado', function () {
    $days = VacationEntitlementCalculator::calculateAccruedDays('2024-01-15');

    expect($days)->toBeGreaterThan(1.0);
});

it('calcula aproximadamente 2.5 dias para 30 dias trabalhados', function () {
    $hireDate = \Carbon\Carbon::now()->subDays(30)->toDateString();
    $days = VacationEntitlementCalculator::calculateAccruedDays($hireDate);

    expect($days)->toBeGreaterThan(2.4)
        ->and($days)->toBeLessThan(2.6);
});

it('retorna zero para contratacao futura', function () {
    $days = VacationEntitlementCalculator::calculateAccruedDays(\Carbon\Carbon::now()->addDay()->toDateString());

    expect($days)->toEqual(0.0);
});
