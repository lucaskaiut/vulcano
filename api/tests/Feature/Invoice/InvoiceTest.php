<?php

use App\Modules\Workflow\Domain\Models\WorkflowStep;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;

describe('invoices', function () {
    it('uploads an invoice and starts workflow', function () {
        \Illuminate\Support\Facades\Storage::fake('local');

        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab@invoice.test']);
        $admin = createUserWithRole('Administrador', ['email' => 'admin@invoice.test']);

        // Create workflow steps for invoice type
        $role = \App\Modules\User\Domain\Models\Role::query()->where('name', 'Administrador')->first();
        WorkflowStep::query()->create([
            'workflow_type' => 'invoice',
            'name' => 'Aprovação RH',
            'order' => 1,
            'visibility_rules' => [['type' => 'role', 'id' => $role->id]],
            'approval_rules' => [['type' => 'role', 'id' => $role->id]],
        ]);

        $file = \Illuminate\Http\UploadedFile::fake()->create('nf.pdf', 100);

        $response = $this->actingAs($colaborador)->postJson('/api/invoices', [
            'competence' => '2026-06',
            'invoice_number' => 'NF-12345',
            'amount' => 5000,
            'issue_date' => '2026-06-15',
            'file' => $file,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.invoice_number', 'NF-12345')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.workflow_instance.status', 'in_progress');

        $this->assertDatabaseHas('invoices', [
            'invoice_number' => 'NF-12345',
            'status' => 'pending',
        ]);
    });

    it('lists all invoices', function () {
        \Illuminate\Support\Facades\Storage::fake('local');
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab2@invoice.test']);
        $admin = createUserWithRole('Administrador', ['email' => 'admin2@invoice.test']);

        \App\Modules\Invoice\Domain\Models\Invoice::query()->create([
            'user_id' => $colaborador->id,
            'competence' => '2026-06',
            'invoice_number' => 'NF-1',
            'amount' => 1000,
            'issue_date' => '2026-06-01',
            'status' => 'pending',
            'original_name' => 'nf.pdf',
            'stored_name' => 'invoices/test.pdf',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/invoices');

        $response->assertOk()->assertJsonCount(1, 'data');
    });

    it('lists invoices for a specific user', function () {
        \Illuminate\Support\Facades\Storage::fake('local');
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab3@invoice.test']);

        \App\Modules\Invoice\Domain\Models\Invoice::query()->create([
            'user_id' => $colaborador->id,
            'competence' => '2026-06',
            'invoice_number' => 'NF-2',
            'amount' => 2000,
            'issue_date' => '2026-06-01',
            'status' => 'pending',
            'original_name' => 'nf.pdf',
            'stored_name' => 'invoices/test2.pdf',
        ]);

        $response = $this->actingAs($colaborador)->getJson("/api/users/{$colaborador->id}/invoices");

        $response->assertOk()->assertJsonCount(1, 'data');
    });

    it('denies upload without permission', function () {
        $user = createUserWithRole('Colaborador', ['email' => 'noperm@invoice.test']);

        // Remove invoices.create from Colaborador role
        $role = $user->roles()->first();
        $role->update(['permissions' => ['documents.view']]);

        $this->actingAs($user, 'sanctum');

        \Illuminate\Support\Facades\Storage::fake('local');
        $file = \Illuminate\Http\UploadedFile::fake()->create('nf.pdf', 50);

        $this->postJson('/api/invoices', [
            'competence' => '2026-06',
            'invoice_number' => 'NF-X',
            'amount' => 1000,
            'issue_date' => '2026-06-01',
            'file' => $file,
        ])->assertForbidden();
    });
});
