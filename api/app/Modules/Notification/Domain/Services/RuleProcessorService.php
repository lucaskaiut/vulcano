<?php

namespace App\Modules\Notification\Domain\Services;

use App\Modules\Notification\Domain\Models\NotificationRule;
use App\Modules\Notification\Domain\Models\NotificationEvent;
use App\Modules\Notification\Domain\Models\NotificationTemplate;
use App\Modules\User\Domain\Models\User;
use Carbon\Carbon;

class RuleProcessorService
{
    public function __construct(
        private readonly TemplateRendererService $renderer,
        private readonly \App\Modules\Notification\Domain\Services\NotificationService $notificationService,
    ) {}

    /** @return int Number of notifications created */
    public function processDueRules(): int
    {
        $now = Carbon::now();
        $totalCreated = 0;

        $rules = NotificationRule::query()
            ->with(['template'])
            ->where('active', true)
            ->whereHas('template', fn ($q) => $q->where('active', true))
            ->get();

        foreach ($rules as $rule) {
            if (! $this->shouldRunNow($rule, $now)) {
                continue;
            }

            $created = $this->processRule($rule);
            $totalCreated += $created;
        }

        return $totalCreated;
    }

    public function processRule(NotificationRule $rule, ?User $targetUser = null): int
    {
        $rule->loadMissing(['template']);
        $created = 0;

        if (! $rule->event || ! $rule->template) {
            return 0;
        }

        $eventName = $rule->event;
        $template = $rule->template;

        $recipients = $targetUser
            ? collect([$targetUser])
            : $this->resolveRecipients($eventName);

        foreach ($recipients as $user) {
            $context = $this->buildContext($user, $eventName);
            $rendered = $this->renderer->render($template, $context);

            $this->notificationService->dispatch(
                $eventName . '_rule',
                $user,
                $rendered['subject'],
                $rendered['body'],
                ['rule_id' => $rule->id, 'event' => $eventName],
            );

            $created++;
        }

        return $created;
    }

    /** @return array<string, mixed> */
    private function buildContext(User $user, string $eventName): array
    {
        $now = Carbon::now();
        $user->loadMissing(['sector', 'manager', 'roles']);

        return [
            'prestador' => [
                'nome' => $user->name,
                'email' => $user->email,
                'cargo' => $user->job_title ?? '',
                'remuneracao' => $user->salary ? 'R$ ' . number_format((float) $user->salary, 2, ',', '.') : '',
                'data_contratacao' => $user->hired_at?->format('d/m/Y') ?? '',
                'modalidade' => ['clt' => 'CLT', 'pj' => 'PJ', 'hybrid' => 'Híbrido'][$user->contract_type] ?? $user->contract_type ?? '',
                'cpf' => $user->cpf ?? '',
                'rg' => $user->rg ?? '',
                'telefone' => $user->phone ?? '',
                'data_nascimento' => $user->birth_date?->format('d/m/Y') ?? '',
                'empresa_tomadora' => $user->contracting_company ?? '',
                'dia_emissao_nf' => $user->invoice_due_day,
            ],
            'endereco' => [
                'cep' => $user->zip_code ?? '',
                'rua' => $user->street ?? '',
                'numero' => $user->number ?? '',
                'bairro' => $user->neighborhood ?? '',
                'cidade' => $user->city ?? '',
                'estado' => $user->state ?? '',
            ],
            'setor' => [
                'nome' => $user->sector?->name ?? '',
            ],
            'gestor' => [
                'nome' => $user->manager?->name ?? '',
            ],
            'dados_bancarios' => $user->bank_details ?? '',
            'contatos_emergencia' => $user->emergency_contacts ?? '',
            'observacoes' => $user->observations ?? '',
            'perfis' => $user->roles?->pluck('name')->implode(', ') ?? '',
            'periodo' => [
                'atual' => $now->format('m/Y'),
                'anterior' => $now->copy()->subMonth()->format('m/Y'),
            ],
            'data' => [
                'atual' => $now->format('d/m/Y'),
                'limite_nf' => $this->formatInvoiceDueDate($user, $now),
            ],
        ];
    }

    /** @return \Illuminate\Database\Eloquent\Collection<int, User> */
    private function resolveRecipients(string $eventName): \Illuminate\Database\Eloquent\Collection
    {
        return match ($eventName) {
            'monthly_invoice_reminder' => User::query()->get(),
            'document_expiring' => $this->getUsersWithExpiringDocuments(),
            'exam_expiring' => $this->getUsersWithExpiringExams(),
            default => User::query()->get(),
        };
    }

    /** @return \Illuminate\Database\Eloquent\Collection<int, User> */
    private function getUsersWithExpiringDocuments(): \Illuminate\Database\Eloquent\Collection
    {
        $ids = \App\Modules\Document\Domain\Models\Document::query()
            ->whereDate('expiration_date', '>=', Carbon::now())
            ->whereDate('expiration_date', '<=', Carbon::now()->addDays(30))
            ->pluck('user_id')
            ->unique();

        return User::query()->whereIn('id', $ids)->get();
    }

    /** @return \Illuminate\Database\Eloquent\Collection<int, User> */
    private function getUsersWithExpiringExams(): \Illuminate\Database\Eloquent\Collection
    {
        $ids = \App\Modules\MedicalExam\Domain\Models\MedicalExam::query()
            ->whereDate('expiration_date', '>=', Carbon::now())
            ->whereDate('expiration_date', '<=', Carbon::now()->addDays(30))
            ->pluck('user_id')
            ->unique();

        return User::query()->whereIn('id', $ids)->get();
    }

    private function shouldRunNow(NotificationRule $rule, Carbon $now): bool
    {
        $config = $rule->schedule_config ?? [];

        return match ($rule->schedule_type) {
            'daily' => $this->matchesTime($config, $now),
            'weekly' => $this->matchesWeekDay($config, $now) && $this->matchesTime($config, $now),
            'monthly' => $this->matchesMonthDay($config, $now) && $this->matchesTime($config, $now),
            'once' => true,
            default => false,
        };
    }

    /** @param  array<string, mixed>  $config */
    private function matchesTime(array $config, Carbon $now): bool
    {
        if (! isset($config['time'])) {
            return true;
        }

        $expected = Carbon::createFromFormat('H:i', $config['time']);

        return $now->format('H:i') === $expected->format('H:i');
    }

    /** @param  array<string, mixed>  $config */
    private function matchesMonthDay(array $config, Carbon $now): bool
    {
        $day = (int) ($config['day'] ?? 1);

        return $now->day === $day;
    }

    /** @param  array<string, mixed>  $config */
    private function matchesWeekDay(array $config, Carbon $now): bool
    {
        $dayOfWeek = (int) ($config['day_of_week'] ?? 1);

        return $now->dayOfWeek === $dayOfWeek;
    }

    private function formatInvoiceDueDate(User $user, Carbon $now): string
    {
        $day = $user->invoice_due_day ?? 5;
        $day = max(1, min(28, (int) $day));

        return $now->copy()->startOfMonth()->setDay($day)->format('d/m/Y');
    }
}
