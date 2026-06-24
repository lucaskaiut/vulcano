<?php

use App\Modules\User\Domain\Models\Role;
use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use App\Modules\Workflow\Domain\Models\Workflow;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use App\Modules\Workflow\Domain\Models\WorkflowStep;

function createWorkflowWithSteps(): Workflow
{
    $workflow = Workflow::factory()->create(['name' => 'Fluxo de teste']);
    $gestor = Role::query()->where('name', 'Gestor')->firstOrFail();
    $controlador = Role::query()->where('name', 'Controlador')->firstOrFail();

    WorkflowStep::factory()->create([
        'workflow_id' => $workflow->id,
        'name' => 'Gestora',
        'order' => 1,
        'responsible_role_id' => $gestor->id,
    ]);
    WorkflowStep::factory()->create([
        'workflow_id' => $workflow->id,
        'name' => 'Controlador',
        'order' => 2,
        'responsible_role_id' => $controlador->id,
    ]);

    return $workflow->fresh('steps');
}

describe('workflow instances store', function () {
    it('inicia um processo de aprovação', function () {
        $initiator = createWorkflowInitiator();
        $workflow = createWorkflowWithSteps();

        $response = $this->actingAs($initiator)->postJson('/api/workflow-instances', [
            'workflow_id' => $workflow->id,
            'title' => 'Solicitação fictícia #1',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.title', 'Solicitação fictícia #1')
            ->assertJsonPath('data.status', WorkflowInstanceStatus::InProgress->value)
            ->assertJsonPath('data.current_step.name', 'Gestora');

        $this->assertDatabaseHas('workflow_instances', [
            'workflow_id' => $workflow->id,
            'status' => WorkflowInstanceStatus::InProgress->value,
        ]);
    });

    it('impede iniciar processo em fluxo inativo', function () {
        $initiator = createWorkflowInitiator();
        $workflow = Workflow::factory()->inactive()->create();
        WorkflowStep::factory()->create(['workflow_id' => $workflow->id, 'order' => 1]);

        $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_id' => $workflow->id,
                'title' => 'Solicitação',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['workflow_id']);
    });
});

describe('workflow instances approve', function () {
    it('aprova etapa atual e avança para a próxima', function () {
        $initiator = createWorkflowInitiator();
        $gestor = createWorkflowActor('Gestor');
        $workflow = createWorkflowWithSteps();

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_id' => $workflow->id,
                'title' => 'Solicitação #1',
            ])
            ->json('data.id');

        $this->actingAs($gestor)
            ->postJson("/api/workflow-instances/{$instanceId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', WorkflowInstanceStatus::InProgress->value)
            ->assertJsonPath('data.current_step.name', 'Controlador');
    });

    it('conclui processo ao aprovar última etapa', function () {
        $initiator = createWorkflowInitiator();
        $gestor = createWorkflowActor('Gestor');
        $controlador = createWorkflowActor('Controlador');
        $workflow = createWorkflowWithSteps();

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_id' => $workflow->id,
                'title' => 'Solicitação #2',
            ])
            ->json('data.id');

        $this->actingAs($gestor)->postJson("/api/workflow-instances/{$instanceId}/approve");

        $this->actingAs($controlador)
            ->postJson("/api/workflow-instances/{$instanceId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', WorkflowInstanceStatus::Approved->value)
            ->assertJsonPath('data.status_label', 'Aprovado')
            ->assertJsonPath('data.current_step', null);
    });

    it('não permite aprovar sem ser responsável pela etapa', function () {
        $initiator = createWorkflowInitiator();
        $controlador = createWorkflowActor('Controlador');
        $workflow = createWorkflowWithSteps();

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_id' => $workflow->id,
                'title' => 'Solicitação #3',
            ])
            ->json('data.id');

        $this->actingAs($controlador)
            ->postJson("/api/workflow-instances/{$instanceId}/approve")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['approver']);
    });

    it('não permite aprovar processo já encerrado', function () {
        $initiator = createWorkflowInitiator();
        $gestor = createWorkflowActor('Gestor');
        $controlador = createWorkflowActor('Controlador');
        $workflow = createWorkflowWithSteps();

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_id' => $workflow->id,
                'title' => 'Solicitação #4',
            ])
            ->json('data.id');

        $this->actingAs($gestor)->postJson("/api/workflow-instances/{$instanceId}/approve");
        $this->actingAs($controlador)->postJson("/api/workflow-instances/{$instanceId}/approve");

        $this->actingAs($gestor)
            ->postJson("/api/workflow-instances/{$instanceId}/approve")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    });
});

describe('workflow instances reject', function () {
    it('reprova processo e encerra na etapa atual', function () {
        $initiator = createWorkflowInitiator();
        $gestor = createWorkflowActor('Gestor');
        $workflow = createWorkflowWithSteps();

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_id' => $workflow->id,
                'title' => 'Solicitação #5',
            ])
            ->json('data.id');

        $this->actingAs($gestor)
            ->postJson("/api/workflow-instances/{$instanceId}/reject", [
                'notes' => 'Documentação incompleta',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', WorkflowInstanceStatus::Rejected->value)
            ->assertJsonPath('data.status_label', 'Reprovado');
    });
});

describe('workflow instances cancel', function () {
    it('cancela processo em andamento', function () {
        $initiator = createWorkflowInitiator();
        $workflow = createWorkflowWithSteps();

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_id' => $workflow->id,
                'title' => 'Solicitação #6',
            ])
            ->json('data.id');

        $this->actingAs($initiator)
            ->postJson("/api/workflow-instances/{$instanceId}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', WorkflowInstanceStatus::Cancelled->value);
    });
});

describe('workflow instances show', function () {
    it('consulta processo com histórico completo', function () {
        $admin = createUserWithRole();
        grantWorkflowPermissionsToRole('Colaborador', ['workflow_instances.view']);
        $initiator = createWorkflowInitiator();
        $gestor = createWorkflowActor('Gestor');
        $workflow = createWorkflowWithSteps();

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_id' => $workflow->id,
                'title' => 'Solicitação #7',
            ])
            ->json('data.id');

        $this->actingAs($gestor)->postJson("/api/workflow-instances/{$instanceId}/approve");

        $this->actingAs($admin)
            ->getJson("/api/workflow-instances/{$instanceId}")
            ->assertOk()
            ->assertJsonCount(2, 'data.histories')
            ->assertJsonPath('data.histories.0.action', 'started')
            ->assertJsonPath('data.histories.1.description', 'Gestora aprovou');
    });
});
