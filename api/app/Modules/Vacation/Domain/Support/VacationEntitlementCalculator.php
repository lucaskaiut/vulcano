<?php

namespace App\Modules\Vacation\Domain\Support;

use Carbon\CarbonInterface;

class VacationEntitlementCalculator
{
    public const DAYS_PER_YEAR = 30;

    public static function calculateEntitledDays(CarbonInterface $startDate, CarbonInterface $endDate): int
    {
        $daysInPeriod = $startDate->diffInDays($endDate) + 1;

        return (int) round(($daysInPeriod / 365) * self::DAYS_PER_YEAR);
    }
}
