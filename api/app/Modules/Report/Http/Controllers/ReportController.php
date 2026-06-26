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

    public function collaborators(Request $request): JsonResponse|Response|StreamedResponse
    {
        $filters = $request->only(['search', 'hired_from', 'hired_to', 'salary_min', 'salary_max']);
        $format = $request->query('format', 'json');
        $data = $this->reportService->collaborators($filters);

        if ($format === 'xlsx') {
            $headers = ['Nome', 'Cargo', 'E-mail', 'Remuneração', 'Contratação', 'Perfis'];
            $rows = $data->map(fn ($u) => [
                $u->name,
                $u->job_title,
                $u->email,
                number_format((float) $u->salary, 2, ',', '.'),
                $u->hired_at?->format('d/m/Y'),
                $u->roles->pluck('name')->implode(', '),
            ])->toArray();

            return $this->reportService->generateXlsx('colaboradores', $headers, $rows);
        }

        if ($format === 'pdf') {
            return $this->reportService->generatePdf('pdf.collaborators', 'colaboradores', ['rows' => $data]);
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

        if ($format === 'xlsx') {
            $headers = ['Colaborador', 'Início', 'Fim', 'Dias', 'Status', 'Justificativa'];
            $rows = $data->map(fn ($r) => [
                $r->user->name,
                $r->start_date->format('d/m/Y'),
                $r->end_date->format('d/m/Y'),
                $r->requested_days,
                $r->status,
                $r->justification ?? '—',
            ])->toArray();

            return $this->reportService->generateXlsx('solicitacoes-ferias', $headers, $rows);
        }

        if ($format === 'pdf') {
            return $this->reportService->generatePdf('pdf.vacation-requests', 'solicitacoes-ferias', ['rows' => $data]);
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

        if ($format === 'xlsx') {
            $headers = ['Colaborador', 'Competência', 'Nº Nota', 'Valor', 'Emissão', 'Status'];
            $rows = $data->map(fn ($i) => [
                $i->user->name,
                $i->competence,
                $i->invoice_number,
                number_format((float) $i->amount, 2, ',', '.'),
                $i->issue_date->format('d/m/Y'),
                $i->status,
            ])->toArray();

            return $this->reportService->generateXlsx('notas-fiscais', $headers, $rows);
        }

        if ($format === 'pdf') {
            return $this->reportService->generatePdf('pdf.invoices', 'notas-fiscais', ['rows' => $data]);
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

        if ($format === 'xlsx') {
            $headers = ['Colaborador', 'Tipo', 'Realização', 'Vencimento', 'Observações'];
            $rows = $data->map(fn ($e) => [
                $e->user->name,
                $e->exam_type,
                $e->execution_date->format('d/m/Y'),
                $e->expiration_date->format('d/m/Y'),
                $e->notes ?? '—',
            ])->toArray();

            return $this->reportService->generateXlsx('exames', $headers, $rows);
        }

        if ($format === 'pdf') {
            return $this->reportService->generatePdf('pdf.medical-exams', 'exames', ['rows' => $data]);
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
