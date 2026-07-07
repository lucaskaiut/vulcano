<?php

namespace App\Modules\Report\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Report\Domain\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService) {}

    /** @param  array<string, string>  $columnMap  key => header */
    private function filterColumns(array $columnMap, ?string $columnsParam): array
    {
        if (! $columnsParam) {
            return [array_values($columnMap), array_keys($columnMap)];
        }

        $selected = explode(',', $columnsParam);
        $filteredMap = array_intersect_key($columnMap, array_flip($selected));

        if (empty($filteredMap)) {
            return [array_values($columnMap), array_keys($columnMap)];
        }

        return [array_values($filteredMap), array_keys($filteredMap)];
    }

    public function collaborators(Request $request): JsonResponse|Response|StreamedResponse
    {
        $filters = $request->only(['search', 'hired_from', 'hired_to', 'salary_min', 'salary_max']);
        $format = $request->query('format', 'json');
        $data = $this->reportService->collaborators($filters);

        $columnMap = [
            'name' => 'Nome',
            'job_title' => 'Cargo',
            'email' => 'E-mail',
            'salary' => 'Remuneração',
            'hired_at' => 'Contratação',
            'roles' => 'Perfis',
        ];

        [$headers, $keys] = $this->filterColumns($columnMap, $request->query('columns'));

        if ($format === 'xlsx') {
            $rows = $data->map(function ($u) use ($keys) {
                $values = [
                    'name' => $u->name,
                    'job_title' => $u->job_title,
                    'email' => $u->email,
                    'salary' => number_format((float) $u->salary, 2, ',', '.'),
                    'hired_at' => $u->hired_at?->format('d/m/Y'),
                    'roles' => $u->roles->pluck('name')->implode(', '),
                ];

                return array_map(fn ($k) => $values[$k] ?? '', $keys);
            })->toArray();

            return $this->reportService->generateXlsx('colaboradores', $headers, $rows);
        }

        if ($format === 'pdf') {
            return $this->reportService->generatePdf('pdf.collaborators', 'colaboradores', [
                'rows' => $data,
                'headers' => $headers,
            ]);
        }

        return response()->json(['data' => $data->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'job_title' => $u->job_title,
            'email' => $u->email,
            'salary' => $u->salary,
            'hired_at' => $u->hired_at?->format('Y-m-d'),
            'roles' => $u->roles->pluck('name'),
        ])]);
    }

    public function vacationRequests(Request $request): JsonResponse|Response|StreamedResponse
    {
        $filters = $request->only(['status', 'user_id', 'date_from', 'date_to']);
        $format = $request->query('format', 'json');
        $data = $this->reportService->vacationRequests($filters);

        $columnMap = [
            'user_name' => 'Colaborador',
            'start_date' => 'Início',
            'end_date' => 'Fim',
            'requested_days' => 'Dias',
            'status' => 'Status',
            'justification' => 'Justificativa',
        ];

        [$headers, $keys] = $this->filterColumns($columnMap, $request->query('columns'));

        if ($format === 'xlsx') {
            $rows = $data->map(function ($r) use ($keys) {
                $values = [
                    'user_name' => $r->user->name,
                    'start_date' => $r->start_date->format('d/m/Y'),
                    'end_date' => $r->end_date->format('d/m/Y'),
                    'requested_days' => $r->requested_days,
                    'status' => $r->status,
                    'justification' => $r->justification ?? '—',
                ];

                return array_map(fn ($k) => $values[$k] ?? '', $keys);
            })->toArray();

            return $this->reportService->generateXlsx('solicitacoes-ferias', $headers, $rows);
        }

        if ($format === 'pdf') {
            return $this->reportService->generatePdf('pdf.vacation-requests', 'solicitacoes-ferias', [
                'rows' => $data,
                'headers' => $headers,
            ]);
        }

        return response()->json(['data' => $data->map(fn ($r) => [
            'id' => $r->id,
            'user_name' => $r->user->name,
            'start_date' => $r->start_date->format('Y-m-d'),
            'end_date' => $r->end_date->format('Y-m-d'),
            'requested_days' => $r->requested_days,
            'status' => $r->status,
            'justification' => $r->justification,
        ])]);
    }

    public function invoices(Request $request): JsonResponse|Response|StreamedResponse
    {
        $filters = $request->only(['status', 'competence', 'user_id']);
        $format = $request->query('format', 'json');
        $data = $this->reportService->invoices($filters);

        $columnMap = [
            'user_name' => 'Colaborador',
            'competence' => 'Competência',
            'invoice_number' => 'Nº Nota',
            'amount' => 'Valor',
            'issue_date' => 'Emissão',
            'status' => 'Status',
        ];

        [$headers, $keys] = $this->filterColumns($columnMap, $request->query('columns'));

        if ($format === 'xlsx') {
            $rows = $data->map(function ($i) use ($keys) {
                $values = [
                    'user_name' => $i->user->name,
                    'competence' => $i->competence,
                    'invoice_number' => $i->invoice_number,
                    'amount' => number_format((float) $i->amount, 2, ',', '.'),
                    'issue_date' => $i->issue_date->format('d/m/Y'),
                    'status' => $i->status,
                ];

                return array_map(fn ($k) => $values[$k] ?? '', $keys);
            })->toArray();

            return $this->reportService->generateXlsx('notas-fiscais', $headers, $rows);
        }

        if ($format === 'pdf') {
            return $this->reportService->generatePdf('pdf.invoices', 'notas-fiscais', [
                'rows' => $data,
                'headers' => $headers,
            ]);
        }

        return response()->json(['data' => $data->map(fn ($i) => [
            'id' => $i->id,
            'user_name' => $i->user->name,
            'competence' => $i->competence,
            'invoice_number' => $i->invoice_number,
            'amount' => $i->amount,
            'issue_date' => $i->issue_date->format('Y-m-d'),
            'status' => $i->status,
        ])]);
    }

    public function medicalExams(Request $request): JsonResponse|Response|StreamedResponse
    {
        $filters = $request->only(['expired', 'user_id']);
        $format = $request->query('format', 'json');
        $data = $this->reportService->medicalExams($filters);

        $columnMap = [
            'user_name' => 'Colaborador',
            'exam_type' => 'Tipo',
            'execution_date' => 'Realização',
            'expiration_date' => 'Vencimento',
            'notes' => 'Observações',
        ];

        [$headers, $keys] = $this->filterColumns($columnMap, $request->query('columns'));

        if ($format === 'xlsx') {
            $rows = $data->map(function ($e) use ($keys) {
                $values = [
                    'user_name' => $e->user->name,
                    'exam_type' => $e->exam_type,
                    'execution_date' => $e->execution_date->format('d/m/Y'),
                    'expiration_date' => $e->expiration_date->format('d/m/Y'),
                    'notes' => $e->notes ?? '—',
                ];

                return array_map(fn ($k) => $values[$k] ?? '', $keys);
            })->toArray();

            return $this->reportService->generateXlsx('exames', $headers, $rows);
        }

        if ($format === 'pdf') {
            return $this->reportService->generatePdf('pdf.medical-exams', 'exames', [
                'rows' => $data,
                'headers' => $headers,
            ]);
        }

        return response()->json(['data' => $data->map(fn ($e) => [
            'id' => $e->id,
            'user_name' => $e->user->name,
            'exam_type' => $e->exam_type,
            'execution_date' => $e->execution_date->format('Y-m-d'),
            'expiration_date' => $e->expiration_date->format('Y-m-d'),
            'notes' => $e->notes,
        ])]);
    }
}
