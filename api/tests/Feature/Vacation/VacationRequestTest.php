<?php

use App\Modules\Vacation\Domain\Enums\VacationRequestStatus;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use App\Modules\Workflow\Domain\Enums\WorkflowType;

beforeEach(function () {
    seedAcl();
});

describe('vacation requests store', function () {
    it('cria solicitação e inicia fluxo de aprovação', function () {
        $user = createUserWithRole('Colaborador');
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $response = $this->actingAs($user)->postJson('/api/vacation-requests', [
            'start_date' => now()->addDays(30)->toDateString(),
            'end_date' => now()->addDays(44)->toDateString(),
            'justification' => 'Férias programadas',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', VacationRequestStatus::Pending->value)
            ->assertJsonPath('data.requested_days', 15)
            ->assertJsonPath('data.user.name', $user->name)
            ->assertJsonPath('data.workflow_instance.status', 'in_progress');

        $this->assertDatabaseHas('vacation_requests', [
            'user_id' => $user->id,
            'status' => VacationRequestStatus::Pending->value,
        ]);

        $this->assertDatabaseHas('workflow_instances', [
            'workflow_type' => WorkflowType::VacationRequest->value,
            'subject_type' => VacationRequest::class,
        ]);
    });

    it('valida datas obrigatórias', function () {
        $user = createUserWithRole('Colaborador');

        $this->actingAs($user)
            ->postJson('/api/vacation-requests', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['start_date', 'end_date']);
    });

    it('valida data de término após início', function () {
        $user = createUserWithRole('Colaborador');

        $this->actingAs($user)
            ->postJson('/api/vacation-requests', [
                'start_date' => now()->addDays(10)->toDateString(),
                'end_date' => now()->addDays(5)->toDateString(),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['end_date']);
    });

    it('nega acesso sem permissão', function () {
        $user = createUserWithRole('Financeiro');

        $this->actingAs($user)
            ->postJson('/api/vacation-requests', [
                'start_date' => now()->addDays(10)->toDateString(),
                'end_date' => now()->addDays(20)->toDateString(),
            ])
            ->assertForbidden();
    });
});

describe('vacation requests index', function () {
    it('colaborador vê apenas suas próprias solicitações', function () {
        $user1 = createUserWithRole('Colaborador');
        $user2 = createUserWithRole('Colaborador');
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $this->actingAs($user1)->postJson('/api/vacation-requests', [
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
        ]);

        $this->actingAs($user2)->postJson('/api/vacation-requests', [
            'start_date' => now()->addDays(30)->toDateString(),
            'end_date' => now()->addDays(40)->toDateString(),
        ]);

        $this->actingAs($user1)
            ->getJson('/api/vacation-requests')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('gestor vê solicitações dos subordinados', function () {
        createWorkflowStepsForType(WorkflowType::VacationRequest);
        $gestor = createWorkflowActor('Gestor');
        $subordinado = createUserWithRole('Colaborador', ['manager_id' => $gestor->id]);

        $this->actingAs($subordinado)->postJson('/api/vacation-requests', [
            'start_date' => now()->addDays(20)->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
        ]);

        $this->actingAs($gestor)
            ->getJson('/api/vacation-requests')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });
});

describe('vacation requests cancel', function () {
    it('cancela solicitação pendente', function () {
        $user = createUserWithRole('Colaborador');
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $id = $this->actingAs($user)->postJson('/api/vacation-requests', [
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
        ])->json('data.id');

        $this->actingAs($user)
            ->postJson("/api/vacation-requests/{$id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', VacationRequestStatus::Cancelled->value);
    });

    it('não cancela solicitação já aprovada', function () {
        $user = createUserWithRole('Colaborador');
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $request = VacationRequest::query()->create([
            'user_id' => $user->id,
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(20),
            'requested_days' => 11,
            'status' => VacationRequestStatus::Approved,
        ]);

        $this->actingAs($user)
            ->postJson("/api/vacation-requests/{$request->id}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    });
});

describe('vacation requests status sync', function () {
    it('atualiza status ao aprovar workflow e cria concessao de ferias', function () {
        $user = createUserWithRole('Colaborador');
        $gestor = createWorkflowActor('Gestor');
        $controlador = createWorkflowActor('Controlador');
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        \App\Modules\Vacation\Domain\Models\VacationBalance::query()->create([
            'user_id' => $user->id,
            'available_days' => 30,
            'accrued_days' => 30,
            'used_days' => 0,
            'additional_days' => 0,
        ]);

        $requestId = $this->actingAs($user)->postJson('/api/vacation-requests', [
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
        ])->json('data.id');

        $request = VacationRequest::query()->findOrFail($requestId);
        $instanceId = $request->workflow_instance_id;

        $this->actingAs($gestor)
            ->postJson("/api/workflow-instances/{$instanceId}/approve")
            ->assertOk();

        $this->actingAs($controlador)
            ->postJson("/api/workflow-instances/{$instanceId}/approve")
            ->assertOk();

        $request->refresh();

        expect($request->status)->toBe(VacationRequestStatus::Approved);

        $grant = \App\Modules\Vacation\Domain\Models\VacationGrant::query()
            ->where('user_id', $user->id)
            ->first();

        expect($grant)->not->toBeNull()
            ->and((int) $grant->days_used)->toBe(11);
    });

    it('atualiza status ao reprovar workflow', function () {
        $user = createUserWithRole('Colaborador');
        $gestor = createWorkflowActor('Gestor');
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $requestId = $this->actingAs($user)->postJson('/api/vacation-requests', [
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
        ])->json('data.id');

        $request = VacationRequest::query()->findOrFail($requestId);
        $instanceId = $request->workflow_instance_id;

        $this->actingAs($gestor)
            ->postJson("/api/workflow-instances/{$instanceId}/reject")
            ->assertOk();

        expect($request->fresh()->status)->toBe(VacationRequestStatus::Rejected);
    });
});
