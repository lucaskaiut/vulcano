<?php

use App\Modules\Vacation\Domain\Support\VacationEntitlementCalculator;

it('calcula dias adquiridos positivos para contratacao no passado', function () {
    $days = VacationEntitlementCalculator::calculateAccruedDays('2024-01-15');

    expect($days)->toBeGreaterThan(1.0);
});

it('calcula 2.5 dias para um mes completo', function () {
    $hireDate = \Carbon\Carbon::now()->subMonth()->toDateString();
    $days = VacationEntitlementCalculator::calculateAccruedDays($hireDate);

    expect($days)->toEqual(2.5);
});

it('retorna zero para contratacao futura', function () {
    $days = VacationEntitlementCalculator::calculateAccruedDays(\Carbon\Carbon::now()->addDay()->toDateString());

    expect($days)->toEqual(0.0);
});
