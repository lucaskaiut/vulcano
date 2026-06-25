<?php

namespace App\Modules\Vacation\Domain\Support;

use Carbon\CarbonInterface;

class VacationEntitlementCalculator
{
    public const DAYS_PER_MONTH = 2.5;

    /**
     * Calcula dias adquiridos: 2,5 por mês completo.
     * Apenas meses fechados contam. Ex: contratado dia 10 → mês 1: 10/01 a 09/02.
     */
    public static function calculateAccruedDays(string $hireDate): float
    {
        $hire = \Carbon\Carbon::parse($hireDate);
        $today = \Carbon\Carbon::now();

        if ($today->lte($hire)) {
            return 0;
        }

        $fullMonths = 0;
        $cursor = $hire->copy();

        while (true) {
            $next = $cursor->copy()->addMonth();

            if ($next->gt($today)) {
                break;
            }

            $fullMonths++;
            $cursor = $next;
        }

        return $fullMonths * self::DAYS_PER_MONTH;
    }

    /** @deprecated Use calculateAccruedDays instead */
    public static function calculateEntitledDays(CarbonInterface $startDate, CarbonInterface $endDate): int
    {
        $fullMonths = 0;
        $cursor = $startDate->copy();

        while (true) {
            $next = $cursor->copy()->addMonth();

            if ($next->gt($endDate)) {
                break;
            }

            $fullMonths++;
            $cursor = $next;
        }

        return (int) round($fullMonths * self::DAYS_PER_MONTH);
    }
}
