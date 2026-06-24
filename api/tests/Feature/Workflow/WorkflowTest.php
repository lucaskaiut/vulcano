<?php

use App\Modules\Workflow\Domain\Models\Workflow;

describe('workflows index', function () {
    it('lista fluxos cadastrados', function () {
        $admin = createUserWithRole();
        Workflow::factory()->create(['name' => 'Aprovação de documentos']);

        $this->actingAs($admin)
            ->getJson('/api/workflows')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Aprovação de documentos');
    });

    it('nega acesso sem permissão', function () {
        $user = createUserWithRole('Colaborador');

        $this->actingAs($user)
            ->getJson('/api/workflows')
            ->assertForbidden();
    });
});

describe('workflows store', function () {
    it('cria um fluxo de aprovação', function () {
        $admin = createUserWithRole();

        $response = $this->actingAs($admin)->postJson('/api/workflows', [
            'name' => 'Aprovação de comissão',
            'description' => 'Fluxo para aprovar comissões',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Aprovação de comissão')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('workflows', [
            'name' => 'Aprovação de comissão',
            'is_active' => true,
        ]);
    });

    it('valida nome obrigatório', function () {
        $admin = createUserWithRole();

        $this->actingAs($admin)
            ->postJson('/api/workflows', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });
});

describe('workflows update', function () {
    it('edita um fluxo existente', function () {
        $admin = createUserWithRole();
        $workflow = Workflow::factory()->create(['name' => 'Fluxo antigo']);

        $this->actingAs($admin)
            ->putJson("/api/workflows/{$workflow->id}", [
                'name' => 'Fluxo atualizado',
                'description' => 'Nova descrição',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Fluxo atualizado');

        expect($workflow->fresh()->description)->toBe('Nova descrição');
    });

    it('inativa um fluxo', function () {
        $admin = createUserWithRole();
        $workflow = Workflow::factory()->create(['is_active' => true]);

        $this->actingAs($admin)
            ->putJson("/api/workflows/{$workflow->id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        expect($workflow->fresh()->is_active)->toBeFalse();
    });
});
