<?php

namespace App\Modules\Vacation\Domain\Support;

use Carbon\CarbonInterface;

class VacationEntitlementCalculator
{
    public const DAYS_PER_MONTH = 2.5;

    public const DAYS_TO_ACCRUE_MONTH = 15;

    /**
     * Calcula dias adquiridos: 2,5 por mês aquisitivo (CLT).
     * Um mês fechado conta integralmente. O mês corrente em andamento conta
     * quando o colaborador já trabalhou 15 dias ou mais dentro dele.
     * Ex: início 22/01, referência 09/07 → 5 meses fechados + mês corrente
     * (22/06 a 09/07 = 18 dias ≥ 15) → 6 meses → 15 dias.
     */
    public static function calculateAccruedDays(string $hireDate): float
    {
        $hire = \Carbon\Carbon::parse($hireDate)->startOfDay();
        $today = \Carbon\Carbon::now()->startOfDay();

        if ($today->lte($hire)) {
            return 0;
        }

        $months = 0;
        $cursor = $hire->copy();

        while (true) {
            $next = $cursor->copy()->addMonth();

            if ($next->lte($today)) {
                $months++;
                $cursor = $next;

                continue;
            }

            $daysWorked = $cursor->diffInDays($today) + 1;

            if ($daysWorked >= self::DAYS_TO_ACCRUE_MONTH) {
                $months++;
            }

            break;
        }

        return $months * self::DAYS_PER_MONTH;
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
