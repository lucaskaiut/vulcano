<?php

use App\Modules\User\Domain\Models\Role;
use App\Modules\Vacation\Domain\Enums\VacationRequestStatus;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use App\Modules\Workflow\Domain\Models\Workflow;
use App\Modules\Workflow\Domain\Models\WorkflowStep;

beforeEach(function () {
    seedAcl();
});

it('cria solicitação de férias e inicia workflow', function () {
    $admin = createUserWithRole();
    $colaborador = createWorkflowInitiator();
    $gestora = createWorkflowActor('Gestor');
    $controlador = createWorkflowActor('Controlador');

    VacationBalance::factory()->create([
        'user_id' => $colaborador->id,
        'accrued_days' => 30,
        'available_days' => 30,
    ]);

    $gestorRole = Role::query()->where('name', 'Gestor')->firstOrFail();
    $controladorRole = Role::query()->where('name', 'Controlador')->firstOrFail();

    $workflowId = $this->actingAs($admin)
        ->postJson('/api/workflows', [
            'name' => 'Aprovação de Férias',
            'description' => 'Fluxo de aprovação de solicitações de férias',
        ])
        ->assertCreated()
        ->json('data.id');

    foreach ([
        ['name' => 'Gestora', 'order' => 1, 'responsible_role_id' => $gestorRole->id],
        ['name' => 'Controlador', 'order' => 2, 'responsible_role_id' => $controladorRole->id],
    ] as $step) {
        $this->actingAs($admin)
            ->postJson("/api/workflows/{$workflowId}/steps", $step)
            ->assertCreated();
    }

    $response = $this->actingAs($colaborador)
        ->postJson('/api/vacation-requests', [
            'user_id' => $colaborador->id,
            'workflow_id' => $workflowId,
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'requested_days' => 10,
            'justification' => 'Férias programadas',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.status', VacationRequestStatus::Pending->value)
        ->assertJsonPath('data.requested_days', 10)
        ->assertJsonPath('data.status_label', 'Pendente');

    $instanceId = $response->json('data.workflow_instance_id');
    expect($instanceId)->not->toBeNull();

    $this->actingAs($colaborador)
        ->getJson("/api/workflow-instances/{$instanceId}")
        ->assertOk()
        ->assertJsonPath('data.status', WorkflowInstanceStatus::InProgress->value);
});

it('aprova solicitação de férias via workflow e debita saldo', function () {
    $admin = createUserWithRole();
    $colaborador = createWorkflowInitiator();
    $gestora = createWorkflowActor('Gestor');

    VacationBalance::factory()->create([
        'user_id' => $colaborador->id,
        'accrued_days' => 30,
        'available_days' => 30,
    ]);

    $gestorRole = Role::query()->where('name', 'Gestor')->firstOrFail();

    $workflowId = $this->actingAs($admin)
        ->postJson('/api/workflows', [
            'name' => 'Aprovação de Férias',
            'description' => 'Fluxo de aprovação',
        ])
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($admin)
        ->postJson("/api/workflows/{$workflowId}/steps", [
            'name' => 'Gestora',
            'order' => 1,
            'responsible_role_id' => $gestorRole->id,
        ])
        ->assertCreated();

    $requestId = $this->actingAs($colaborador)
        ->postJson('/api/vacation-requests', [
            'user_id' => $colaborador->id,
            'workflow_id' => $workflowId,
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'requested_days' => 10,
        ])
        ->assertCreated()
        ->json('data.id');

    $request = VacationRequest::query()->findOrFail($requestId);
    $instanceId = $request->workflow_instance_id;

    $this->actingAs($gestora)
        ->postJson("/api/workflow-instances/{$instanceId}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', WorkflowInstanceStatus::Approved->value);

    $request->refresh();
    expect($request->status)->toBe(VacationRequestStatus::Approved);

    $balance = VacationBalance::query()->where('user_id', $colaborador->id)->firstOrFail();
    expect((int) $balance->available_days)->toBe(20);
    expect((int) $balance->used_days)->toBe(10);
});

it('reprova solicitação de férias via workflow', function () {
    $admin = createUserWithRole();
    $colaborador = createWorkflowInitiator();
    $gestora = createWorkflowActor('Gestor');

    VacationBalance::factory()->create([
        'user_id' => $colaborador->id,
        'accrued_days' => 30,
        'available_days' => 30,
    ]);

    $gestorRole = Role::query()->where('name', 'Gestor')->firstOrFail();

    $workflowId = $this->actingAs($admin)
        ->postJson('/api/workflows', [
            'name' => 'Aprovação de Férias',
            'description' => 'Fluxo de aprovação',
        ])
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($admin)
        ->postJson("/api/workflows/{$workflowId}/steps", [
            'name' => 'Gestora',
            'order' => 1,
            'responsible_role_id' => $gestorRole->id,
        ])
        ->assertCreated();

    $requestId = $this->actingAs($colaborador)
        ->postJson('/api/vacation-requests', [
            'user_id' => $colaborador->id,
            'workflow_id' => $workflowId,
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'requested_days' => 10,
        ])
        ->assertCreated()
        ->json('data.id');

    $request = VacationRequest::query()->findOrFail($requestId);
    $instanceId = $request->workflow_instance_id;

    $this->actingAs($gestora)
        ->postJson("/api/workflow-instances/{$instanceId}/reject")
        ->assertOk()
        ->assertJsonPath('data.status', WorkflowInstanceStatus::Rejected->value);

    $request->refresh();
    expect($request->status)->toBe(VacationRequestStatus::Rejected);

    $balance = VacationBalance::query()->where('user_id', $colaborador->id)->firstOrFail();
    expect((int) $balance->available_days)->toBe(30);
});

it('cancela solicitação de férias pendente', function () {
    $admin = createUserWithRole();
    $colaborador = createWorkflowInitiator();
    $gestora = createWorkflowActor('Gestor');

    VacationBalance::factory()->create([
        'user_id' => $colaborador->id,
        'accrued_days' => 30,
        'available_days' => 30,
    ]);

    $gestorRole = Role::query()->where('name', 'Gestor')->firstOrFail();

    $workflowId = $this->actingAs($admin)
        ->postJson('/api/workflows', [
            'name' => 'Aprovação de Férias',
            'description' => 'Fluxo',
        ])
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($admin)
        ->postJson("/api/workflows/{$workflowId}/steps", [
            'name' => 'Gestora',
            'order' => 1,
            'responsible_role_id' => $gestorRole->id,
        ])
        ->assertCreated();

    $requestId = $this->actingAs($colaborador)
        ->postJson('/api/vacation-requests', [
            'user_id' => $colaborador->id,
            'workflow_id' => $workflowId,
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'requested_days' => 10,
        ])
        ->assertCreated()
        ->json('data.id');

    $this->actingAs($colaborador)
        ->postJson("/api/vacation-requests/{$requestId}/cancel")
        ->assertOk()
        ->assertJsonPath('data.status', VacationRequestStatus::Cancelled->value);

    $request = VacationRequest::query()->findOrFail($requestId);
    expect($request->status)->toBe(VacationRequestStatus::Cancelled);

    $instance = $request->workflowInstance()->first();
    expect($instance->status)->toBe(WorkflowInstanceStatus::Cancelled);
});

it('lista solicitações de férias do colaborador', function () {
    $admin = createUserWithRole();
    $colaborador = createWorkflowInitiator();

    VacationRequest::factory()->count(2)->create(['user_id' => $colaborador->id]);

    $response = $this->actingAs($admin)
        ->getJson("/api/vacation-requests?user_id={$colaborador->id}");

    $response->assertOk()
        ->assertJsonCount(2, 'data');
});

it('impede criar solicitação com data final anterior à inicial', function () {
    $colaborador = createWorkflowInitiator();

    $gestorRole = Role::query()->where('name', 'Gestor')->firstOrFail();
    $workflow = Workflow::factory()->create();
    WorkflowStep::factory()->create([
        'workflow_id' => $workflow->id,
        'order' => 1,
        'responsible_role_id' => $gestorRole->id,
    ]);

    $this->actingAs($colaborador)
        ->postJson('/api/vacation-requests', [
            'user_id' => $colaborador->id,
            'workflow_id' => $workflow->id,
            'start_date' => now()->addDays(20)->toDateString(),
            'end_date' => now()->addDays(10)->toDateString(),
            'requested_days' => 10,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['end_date']);
});

it('permite criar solicitação mesmo com saldo zerado', function () {
    $colaborador = createWorkflowInitiator();

    VacationBalance::factory()->create([
        'user_id' => $colaborador->id,
        'accrued_days' => 0,
        'available_days' => 0,
    ]);

    $gestorRole = Role::query()->where('name', 'Gestor')->firstOrFail();
    $workflow = Workflow::factory()->create();
    WorkflowStep::factory()->create([
        'workflow_id' => $workflow->id,
        'order' => 1,
        'responsible_role_id' => $gestorRole->id,
    ]);

    $this->actingAs($colaborador)
        ->postJson('/api/vacation-requests', [
            'user_id' => $colaborador->id,
            'workflow_id' => $workflow->id,
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'requested_days' => 15,
        ])
        ->assertCreated();
});
