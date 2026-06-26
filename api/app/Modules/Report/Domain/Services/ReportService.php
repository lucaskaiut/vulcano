<?php

namespace App\Modules\Report\Domain\Services;

use App\Modules\Commission\Domain\Models\Commission;
use App\Modules\Cost\Domain\Models\CollaboratorCost;
use App\Modules\Invoice\Domain\Models\Invoice;
use App\Modules\MedicalExam\Domain\Models\MedicalExam;
use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Writer\XLSX\Writer;
use Illuminate\Support\Facades\Response;

class ReportService
{
    /** @param  array{search?: string, hired_from?: string, hired_to?: string, salary_min?: float, salary_max?: float}  $filters */
    public function collaborators(array $filters): Collection
    {
        return User::query()
            ->with('roles')
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->when($filters['hired_from'] ?? null, fn ($q, $v) => $q->where('hired_at', '>=', $v))
            ->when($filters['hired_to'] ?? null, fn ($q, $v) => $q->where('hired_at', '<=', $v))
            ->when($filters['salary_min'] ?? null, fn ($q, $v) => $q->where('salary', '>=', (float) $v))
            ->when($filters['salary_max'] ?? null, fn ($q, $v) => $q->where('salary', '<=', (float) $v))
            ->orderBy('name')
            ->get();
    }

    /** @param  array{month?: string, user_id?: int}  $filters */
    public function costs(array $filters): Collection
    {
        return CollaboratorCost::query()
            ->with(['user', 'category'])
            ->when($filters['user_id'] ?? null, fn ($q, $v) => $q->where('user_id', $v))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /** @param  array{status?: string, user_id?: int, date_from?: string, date_to?: string}  $filters */
    public function vacationRequests(array $filters): Collection
    {
        return VacationRequest::query()
            ->with(['user', 'workflowInstance'])
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['user_id'] ?? null, fn ($q, $v) => $q->where('user_id', $v))
            ->when($filters['date_from'] ?? null, fn ($q, $v) => $q->where('start_date', '>=', $v))
            ->when($filters['date_to'] ?? null, fn ($q, $v) => $q->where('end_date', '<=', $v))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /** @param  array{status?: string, user_id?: int}  $filters */
    public function commissions(array $filters): Collection
    {
        return Commission::query()
            ->with(['sale.user'])
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['user_id'] ?? null, fn ($q, $v) => $q->whereHas('sale', fn ($sq) => $sq->where('user_id', $v)))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /** @param  array{status?: string, competence?: string, user_id?: int}  $filters */
    public function invoices(array $filters): Collection
    {
        return Invoice::query()
            ->with(['user'])
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['competence'] ?? null, fn ($q, $v) => $q->where('competence', $v))
            ->when($filters['user_id'] ?? null, fn ($q, $v) => $q->where('user_id', $v))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /** @param  array{expired?: bool, user_id?: int}  $filters */
    public function medicalExams(array $filters): Collection
    {
        return MedicalExam::query()
            ->with('user')
            ->when(isset($filters['expired']), function ($q) use ($filters) {
                if ($filters['expired']) {
                    $q->whereDate('expiration_date', '<', now());
                } else {
                    $q->whereDate('expiration_date', '>=', now());
                }
            })
            ->when($filters['user_id'] ?? null, fn ($q, $v) => $q->where('user_id', $v))
            ->orderBy('expiration_date')
            ->get();
    }

    /** @param  array<string, mixed>  $rows */
    public function generateXlsx(string $filePrefix, array $headers, array $rows): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $filename = $filePrefix . '_' . now()->format('Y-m-d') . '.xlsx';

        return response()->streamDownload(function () use ($headers, $rows) {
            $writer = new Writer;
            $writer->openToBrowser('php://output');

            $writer->addRow(Row::fromValues($headers));

            foreach ($rows as $row) {
                $writer->addRow(Row::fromValues($row));
            }

            $writer->close();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /** @param  array<string, mixed>  $data */
    public function generatePdf(string $view, string $filePrefix, array $data): \Illuminate\Http\Response
    {
        $filename = $filePrefix . '_' . now()->format('Y-m-d') . '.pdf';
        $pdf = Pdf::loadView($view, $data);

        return $pdf->download($filename);
    }
}
