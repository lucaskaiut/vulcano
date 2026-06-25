<?php

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;

describe('workflow instances list', function () {
    it('lista processos com escopo — iniciador vê os próprios', function () {
        $admin = createUserWithRole();
        $initiator = createWorkflowInitiator();
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
                'title' => 'Solicitação #1',
            ])
            ->assertCreated();

        $this->actingAs($initiator)
            ->getJson('/api/workflow-instances')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Solicitação #1');
    });

    it('gestor vê solicitações dos subordinados', function () {
        $admin = createUserWithRole();
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $gestor = createWorkflowActor('Gestor');

        $subordinado = createWorkflowInitiator(['manager_id' => $gestor->id]);

        $this->actingAs($subordinado)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
                'title' => 'Solicitação subordinado',
            ])
            ->assertCreated();

        $this->actingAs($gestor)
            ->getJson('/api/workflow-instances')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Solicitação subordinado');
    });

    it('aprovador vê solicitações onde é responsável pela etapa', function () {
        $admin = createUserWithRole();
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $initiator = createWorkflowInitiator();
        $gestor = createWorkflowActor('Gestor');

        $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
                'title' => 'Solicitação para gestor',
            ])
            ->assertCreated();

        $this->actingAs($gestor)
            ->getJson('/api/workflow-instances')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('admin com view_all vê todos os processos', function () {
        $admin = createUserWithRole();
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $initiator1 = createWorkflowInitiator();
        $initiator2 = createWorkflowInitiator();

        $this->actingAs($initiator1)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
                'title' => 'Solicitação A',
            ])
            ->assertCreated();

        $this->actingAs($initiator2)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
                'title' => 'Solicitação B',
            ])
            ->assertCreated();

        $this->actingAs($admin)
            ->getJson('/api/workflow-instances')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    });

    it('colaborador não vê solicitações de outros', function () {
        $admin = createUserWithRole();
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $initiator1 = createWorkflowInitiator();
        $initiator2 = createWorkflowInitiator();

        $this->actingAs($initiator1)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
                'title' => 'Solicitação do user 1',
            ])
            ->assertCreated();

        $this->actingAs($initiator2)
            ->getJson('/api/workflow-instances')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });
});

describe('workflow instances store', function () {
    it('inicia um processo de aprovação', function () {
        $initiator = createWorkflowInitiator();
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $response = $this->actingAs($initiator)->postJson('/api/workflow-instances', [
            'workflow_type' => 'vacation_request',
            'title' => 'Solicitação fictícia #1',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.title', 'Solicitação fictícia #1')
            ->assertJsonPath('data.status', WorkflowInstanceStatus::InProgress->value)
            ->assertJsonPath('data.current_step.name', 'Gestora')
            ->assertJsonPath('data.workflow_type', 'vacation_request');

        $this->assertDatabaseHas('workflow_instances', [
            'workflow_type' => 'vacation_request',
            'status' => WorkflowInstanceStatus::InProgress->value,
        ]);
    });

    it('impede iniciar processo em fluxo sem etapas', function () {
        $initiator = createWorkflowInitiator();

        $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'commission',
                'title' => 'Solicitação',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['workflow_type']);
    });

    it('valida workflow_type obrigatório e válido', function () {
        $initiator = createWorkflowInitiator();

        $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'title' => 'Solicitação',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['workflow_type']);
    });
});

describe('workflow instances approve', function () {
    it('aprova etapa atual e avança para a próxima', function () {
        $initiator = createWorkflowInitiator();
        $gestor = createWorkflowActor('Gestor');
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
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
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
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
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
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
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
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
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
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
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
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
        $initiator = createWorkflowInitiator();
        $gestor = createWorkflowActor('Gestor');
        createWorkflowStepsForType(WorkflowType::VacationRequest);

        $instanceId = $this->actingAs($initiator)
            ->postJson('/api/workflow-instances', [
                'workflow_type' => 'vacation_request',
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
