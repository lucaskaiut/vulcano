<?php

describe('notifications', function () {
    it('dispatches notification on workflow approval', function () {
        \Illuminate\Support\Facades\Mail::fake();

        $admin = createUserWithRole('Administrador', ['email' => 'admin@notif.test']);
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab@notif.test']);

        // Create workflow steps for vacation_request
        $role = \App\Modules\User\Domain\Models\Role::query()->where('name', 'Administrador')->first();
        \App\Modules\Workflow\Domain\Models\WorkflowStep::query()->create([
            'workflow_type' => 'vacation_request',
            'name' => 'Aprovação',
            'order' => 1,
            'visibility_rules' => [['type' => 'role', 'id' => $role->id]],
            'approval_rules' => [['type' => 'role', 'id' => $role->id]],
        ]);

        // Create vacation balance
        \App\Modules\Vacation\Domain\Models\VacationBalance::query()->create([
            'user_id' => $colaborador->id,
            'available_days' => 30,
            'accrued_days' => 30,
        ]);

        // Create workflow instance
        $instance = app(\App\Modules\Workflow\Domain\Services\WorkflowInstanceService::class)
            ->start($colaborador, [
                'workflow_type' => 'vacation_request',
                'title' => 'Férias Colab',
                'subject_type' => \App\Modules\Vacation\Domain\Models\VacationRequest::class,
                'subject_id' => 1,
            ]);

        // Approve
        app(\App\Modules\Workflow\Domain\Services\WorkflowInstanceService::class)
            ->approve($instance, $admin);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $colaborador->id,
            'type' => 'workflow_approved',
        ]);
    });

    it('dispatches notification on workflow rejection', function () {
        \Illuminate\Support\Facades\Mail::fake();

        $admin = createUserWithRole('Administrador', ['email' => 'admin2@notif.test']);
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab2@notif.test']);

        $role = \App\Modules\User\Domain\Models\Role::query()->where('name', 'Administrador')->first();
        \App\Modules\Workflow\Domain\Models\WorkflowStep::query()->create([
            'workflow_type' => 'vacation_request',
            'name' => 'Aprovação',
            'order' => 1,
            'visibility_rules' => [['type' => 'role', 'id' => $role->id]],
            'approval_rules' => [['type' => 'role', 'id' => $role->id]],
        ]);

        $instance = app(\App\Modules\Workflow\Domain\Services\WorkflowInstanceService::class)
            ->start($colaborador, [
                'workflow_type' => 'vacation_request',
                'title' => 'Férias Colab 2',
            ]);

        app(\App\Modules\Workflow\Domain\Services\WorkflowInstanceService::class)
            ->reject($instance, $admin, 'Não aprovado');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $colaborador->id,
            'type' => 'workflow_rejected',
        ]);
    });

    it('lists notifications for authenticated user', function () {
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab3@notif.test']);

        \App\Modules\Notification\Domain\Models\Notification::query()->create([
            'user_id' => $colaborador->id,
            'notification_channel_id' => 1,
            'type' => 'exam_expiring',
            'title' => 'Exame vencendo',
            'body' => 'Seu exame ASO vence em 5 dias.',
        ]);

        $response = $this->actingAs($colaborador)->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'exam_expiring');
    });

    it('does not show notifications from other users', function () {
        $colab1 = createUserWithRole('Colaborador', ['email' => 'a@notif.test']);
        $colab2 = createUserWithRole('Colaborador', ['email' => 'b@notif.test']);

        \App\Modules\Notification\Domain\Models\Notification::query()->create([
            'user_id' => $colab1->id,
            'notification_channel_id' => 1,
            'type' => 'test',
            'title' => 'Para colab1',
            'body' => 'Apenas colab1 deve ver',
        ]);

        \App\Modules\Notification\Domain\Models\Notification::query()->create([
            'user_id' => $colab2->id,
            'notification_channel_id' => 1,
            'type' => 'test',
            'title' => 'Para colab2',
            'body' => 'Apenas colab2 deve ver',
        ]);

        $response = $this->actingAs($colab1)->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Para colab1');
    });
});
