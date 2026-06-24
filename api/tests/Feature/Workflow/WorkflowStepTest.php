<?php

use App\Modules\User\Domain\Models\Role;
use App\Modules\Workflow\Domain\Models\Workflow;
use App\Modules\Workflow\Domain\Models\WorkflowStep;

describe('workflow steps store', function () {
    it('adiciona etapa ao fluxo', function () {
        $admin = createUserWithRole();
        $workflow = Workflow::factory()->create();
        $role = Role::query()->where('name', 'Gestor')->firstOrFail();

        $response = $this->actingAs($admin)->postJson("/api/workflows/{$workflow->id}/steps", [
            'name' => 'Gestora',
            'responsible_role_id' => $role->id,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Gestora')
            ->assertJsonPath('data.order', 1);

        $this->assertDatabaseHas('workflow_steps', [
            'workflow_id' => $workflow->id,
            'name' => 'Gestora',
            'order' => 1,
        ]);
    });
});

describe('workflow steps update', function () {
    it('reordena etapas do fluxo', function () {
        $admin = createUserWithRole();
        $workflow = Workflow::factory()->create();

        $step1 = WorkflowStep::factory()->create([
            'workflow_id' => $workflow->id,
            'name' => 'Etapa 1',
            'order' => 1,
        ]);
        $step2 = WorkflowStep::factory()->create([
            'workflow_id' => $workflow->id,
            'name' => 'Etapa 2',
            'order' => 2,
        ]);
        $step3 = WorkflowStep::factory()->create([
            'workflow_id' => $workflow->id,
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
        $workflow = Workflow::factory()->create();
        $step = WorkflowStep::factory()->create([
            'workflow_id' => $workflow->id,
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
        $workflow = Workflow::factory()->create();

        $step1 = WorkflowStep::factory()->create([
            'workflow_id' => $workflow->id,
            'order' => 1,
        ]);
        $step2 = WorkflowStep::factory()->create([
            'workflow_id' => $workflow->id,
            'order' => 2,
        ]);

        $this->actingAs($admin)
            ->deleteJson("/api/workflow-steps/{$step1->id}")
            ->assertOk();

        $this->assertDatabaseMissing('workflow_steps', ['id' => $step1->id]);
        expect($step2->fresh()->order)->toBe(1);
    });
});
