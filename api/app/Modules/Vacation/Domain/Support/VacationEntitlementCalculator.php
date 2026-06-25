<?php

namespace App\Modules\Vacation\Domain\Support;

use Carbon\CarbonInterface;

class VacationEntitlementCalculator
{
    public const DAYS_PER_MONTH = 2.5;

    /**
     * Calcula dias adquiridos: 2,5 por mês completo + proporcional do mês atual.
     * Cada período de 1 mês começa no dia da contratação e vai até o dia anterior
     * do mesmo número no mês seguinte. Ex: contratado dia 10 → mês 1: 10/01 a 09/02.
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

        // Avança meses completos até ultrapassar hoje
        while (true) {
            $next = $cursor->copy()->addMonth();

            if ($next->gt($today)) {
                break;
            }

            $fullMonths++;
            $cursor = $next;
        }

        // Fração do período atual: dias decorridos / total de dias do período
        $endOfCurrentPeriod = $cursor->copy()->addMonth();
        $totalDays = $cursor->diffInDays($endOfCurrentPeriod);
        $elapsedDays = $cursor->diffInDays($today);

        $partialFraction = $elapsedDays / $totalDays;

        return ($fullMonths + $partialFraction) * self::DAYS_PER_MONTH;
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

        $endOfPeriod = $cursor->copy()->addMonth();
        $totalDays = $cursor->diffInDays($endOfPeriod);
        $elapsedDays = $cursor->diffInDays($endDate);

        $partialFraction = $elapsedDays / $totalDays;

        return (int) round(($fullMonths + $partialFraction) * self::DAYS_PER_MONTH);
    }
}
