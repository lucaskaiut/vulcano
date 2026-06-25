<?php

namespace App\Modules\Vacation\Domain\Support;

use Carbon\CarbonInterface;

class VacationEntitlementCalculator
{
    public const DAYS_PER_MONTH = 2.5;

    public static function calculateAccruedDays(string $hireDate): float
    {
        $hire = \Carbon\Carbon::parse($hireDate);
        $today = \Carbon\Carbon::now();

        $daysWorked = max(0, $hire->diffInDays($today));

        return ($daysWorked / 30) * self::DAYS_PER_MONTH;
    }

    /** @deprecated Use calculateAccruedDays instead */
    public static function calculateEntitledDays(CarbonInterface $startDate, CarbonInterface $endDate): int
    {
        $daysInPeriod = max(0, $startDate->diffInDays($endDate));

        return (int) round(($daysInPeriod / 30) * self::DAYS_PER_MONTH);
    }
}
