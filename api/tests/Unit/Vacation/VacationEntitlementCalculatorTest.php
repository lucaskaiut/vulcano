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

it('conta o mes corrente quando atinge 15 dias trabalhados', function () {
    \Carbon\Carbon::setTestNow('2026-07-09');

    $days = VacationEntitlementCalculator::calculateAccruedDays('2026-01-22');

    expect($days)->toEqual(15.0);

    \Carbon\Carbon::setTestNow();
});

it('nao conta o mes corrente quando trabalhou menos de 15 dias', function () {
    \Carbon\Carbon::setTestNow('2026-07-05');

    $days = VacationEntitlementCalculator::calculateAccruedDays('2026-01-22');

    expect($days)->toEqual(12.5);

    \Carbon\Carbon::setTestNow();
});
