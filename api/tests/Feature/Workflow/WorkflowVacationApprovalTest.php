<?php

use App\Modules\User\Domain\Models\Role;
use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use App\Modules\Workflow\Domain\Enums\WorkflowType;

it('executa cenário completo de aprovação de férias', function () {
    $admin = createUserWithRole();
    $initiator = createWorkflowInitiator();
    $gestora = createWorkflowActor('Gestor');
    $controlador = createWorkflowActor('Controlador');
    $rh = createWorkflowActor('RH');

    $gestorRole = Role::query()->where('name', 'Gestor')->firstOrFail();
    $controladorRole = Role::query()->where('name', 'Controlador')->firstOrFail();
    $rhRole = Role::query()->where('name', 'RH')->firstOrFail();

    foreach ([
        ['name' => 'Gestora', 'order' => 1, 'responsible_role_id' => $gestorRole->id],
        ['name' => 'Controlador', 'order' => 2, 'responsible_role_id' => $controladorRole->id],
        ['name' => 'RH', 'order' => 3, 'responsible_role_id' => $rhRole->id],
    ] as $step) {
        $this->actingAs($admin)
            ->postJson('/api/workflow-types/vacation_request/steps', $step)
            ->assertCreated();
    }

    $instanceId = $this->actingAs($initiator)
        ->postJson('/api/workflow-instances', [
            'workflow_type' => WorkflowType::VacationRequest->value,
            'title' => 'Solicitação de férias #123',
        ])
        ->assertCreated()
        ->assertJsonPath('data.current_step.name', 'Gestora')
        ->json('data.id');

    $this->actingAs($gestora)
        ->postJson("/api/workflow-instances/{$instanceId}/approve")
        ->assertOk()
        ->assertJsonPath('data.current_step.name', 'Controlador');

    $this->actingAs($controlador)
        ->postJson("/api/workflow-instances/{$instanceId}/approve")
        ->assertOk()
        ->assertJsonPath('data.current_step.name', 'RH');

    $this->actingAs($rh)
        ->postJson("/api/workflow-instances/{$instanceId}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', WorkflowInstanceStatus::Approved->value)
        ->assertJsonPath('data.status_label', 'Aprovado');

    $response = $this->actingAs($admin)
        ->getJson("/api/workflow-instances/{$instanceId}")
        ->assertOk();

    $response
        ->assertJsonPath('data.status_label', 'Aprovado')
        ->assertJsonCount(4, 'data.histories')
        ->assertJsonPath('data.histories.1.description', 'Gestora aprovou')
        ->assertJsonPath('data.histories.2.description', 'Controlador aprovou')
        ->assertJsonPath('data.histories.3.description', 'RH aprovou');

    $this->assertDatabaseHas('workflow_instances', [
        'id' => $instanceId,
        'status' => WorkflowInstanceStatus::Approved->value,
        'workflow_type' => WorkflowType::VacationRequest->value,
    ]);
});
