<?php

use App\Modules\User\Domain\Models\Role;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Models\WorkflowStep;

describe('workflow steps list', function () {
    it('lista etapas de um tipo de fluxo', function () {
        $admin = createUserWithRole();
        WorkflowStep::factory()->forType(WorkflowType::VacationRequest)->create([
            'name' => 'Gestora',
            'order' => 1,
        ]);

        $this->actingAs($admin)
            ->getJson('/api/workflow-types/vacation_request/steps')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Gestora');
    });

    it('nega acesso sem permissão', function () {
        $user = createUserWithRole('Financeiro');

        $this->actingAs($user)
            ->getJson('/api/workflow-types/vacation_request/steps')
            ->assertForbidden();
    });
});

describe('workflow steps store', function () {
    it('adiciona etapa ao fluxo', function () {
        $admin = createUserWithRole();
        $role = Role::query()->where('name', 'Gestor')->firstOrFail();

        $response = $this->actingAs($admin)->postJson('/api/workflow-types/vacation_request/steps', [
            'name' => 'Gestora',
            'responsible_role_id' => $role->id,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Gestora')
            ->assertJsonPath('data.order', 1)
            ->assertJsonPath('data.workflow_type', 'vacation_request');

        $this->assertDatabaseHas('workflow_steps', [
            'workflow_type' => 'vacation_request',
            'name' => 'Gestora',
            'order' => 1,
        ]);
    });

    it('valida nome obrigatório', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->postJson('/api/workflow-types/vacation_request/steps', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });
});

describe('workflow steps update', function () {
    it('reordena etapas do fluxo', function () {
        $admin = createUserWithRole();

        $step1 = WorkflowStep::factory()->forType(WorkflowType::VacationRequest)->create([
            'name' => 'Etapa 1',
            'order' => 1,
        ]);
        $step2 = WorkflowStep::factory()->forType(WorkflowType::VacationRequest)->create([
            'name' => 'Etapa 2',
            'order' => 2,
        ]);
        $step3 = WorkflowStep::factory()->forType(WorkflowType::VacationRequest)->create([
            'name' => 'Etapa 3',
            'order' => 3,
        ]);

        $this->actingAs($admin)
            ->putJson("/api/workflow-steps/{$step3->id}", ['order' => 1])
            ->assertOk()
            ->assertJsonPath('data.order', 1);

        expect($step1->fresh()->order)->toBe(2)
            ->and($step2->fresh()->order)->toBe(3)
            ->and($step3->fresh()->order)->toBe(1);
    });

    it('atualiza dados da etapa', function () {
        $admin = createUserWithRole();
        $step = WorkflowStep::factory()->forType(WorkflowType::VacationRequest)->create([
            'name' => 'Antiga',
        ]);

        $this->actingAs($admin)
            ->putJson("/api/workflow-steps/{$step->id}", ['name' => 'Nova etapa'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Nova etapa');
    });
});

describe('workflow steps destroy', function () {
    it('remove etapa do fluxo e renumera as demais', function () {
        $admin = createUserWithRole();

        $step1 = WorkflowStep::factory()->forType(WorkflowType::VacationRequest)->create([
            'order' => 1,
        ]);
        $step2 = WorkflowStep::factory()->forType(WorkflowType::VacationRequest)->create([
            'order' => 2,
        ]);

        $this->actingAs($admin)
            ->deleteJson("/api/workflow-steps/{$step1->id}")
            ->assertOk();

        $this->assertDatabaseMissing('workflow_steps', ['id' => $step1->id]);
        expect($step2->fresh()->order)->toBe(1);
    });
});

describe('workflow steps reorder', function () {
    it('reordena via endpoint dedicado', function () {
        $admin = createUserWithRole();

        $step1 = WorkflowStep::factory()->forType(WorkflowType::VacationRequest)->create([
            'name' => 'Etapa 1',
            'order' => 1,
        ]);
        $step2 = WorkflowStep::factory()->forType(WorkflowType::VacationRequest)->create([
            'name' => 'Etapa 2',
            'order' => 2,
        ]);

        $this->actingAs($admin)
            ->putJson("/api/workflow-steps/{$step1->id}/reorder", ['order' => 2])
            ->assertOk()
            ->assertJsonPath('data.order', 2);

        expect($step1->fresh()->order)->toBe(2)
            ->and($step2->fresh()->order)->toBe(1);
    });
});
