<?php

use App\Modules\Document\Domain\Models\DocumentType;

describe('document types', function () {
    it('lists document types', function () {
        $admin = createUserWithRole();
        DocumentType::query()->create(['name' => 'Contrato Social']);

        $response = $this->actingAs($admin)->getJson('/api/document-types');

        $response
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'expiration_required']]])
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Contrato Social');
    });

    it('creates a document type', function () {
        $admin = createUserWithRole();

        $response = $this->actingAs($admin)->postJson('/api/document-types', [
            'name' => 'RG',
            'expiration_required' => true,
        ]);

        $response->assertCreated()->assertJsonPath('data.name', 'RG');

        $this->assertDatabaseHas('document_types', [
            'name' => 'RG',
            'expiration_required' => true,
        ]);
    });

    it('updates a document type', function () {
        $admin = createUserWithRole();
        $type = DocumentType::query()->create(['name' => 'CPF']);

        $response = $this->actingAs($admin)->putJson("/api/document-types/{$type->id}", [
            'name' => 'CPF Atualizado',
        ]);

        $response->assertOk()->assertJsonPath('data.name', 'CPF Atualizado');
    });

    it('denies document type creation without permission', function () {
        $colaborador = createUserWithRole('Colaborador');

        $this->actingAs($colaborador)
            ->postJson('/api/document-types', ['name' => 'Teste'])
            ->assertForbidden();
    });
});

describe('documents', function () {
    it('uploads a document for a user', function () {
        $admin = createUserWithRole();
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab@test.com']);
        $type = DocumentType::query()->create(['name' => 'Contrato']);

        \Illuminate\Support\Facades\Storage::fake('local');

        $response = $this->actingAs($admin)->postJson(
            "/api/users/{$colaborador->id}/documents",
            [
                'document_type_id' => $type->id,
                'expiration_date' => '2026-12-31',
                'file' => \Illuminate\Http\UploadedFile::fake()->create('contrato.pdf', 100),
            ],
        );

        $response->assertCreated()
            ->assertJsonPath('data.original_name', 'contrato.pdf')
            ->assertJsonPath('data.expiration_date', '2026-12-31');

        $this->assertDatabaseHas('documents', [
            'user_id' => $colaborador->id,
            'document_type_id' => $type->id,
        ]);
    });

    it('lists documents for a user', function () {
        $admin = createUserWithRole();
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab2@test.com']);
        $type = DocumentType::query()->create(['name' => 'RG']);

        \Illuminate\Support\Facades\Storage::fake('local');
        $file = \Illuminate\Http\UploadedFile::fake()->create('rg.pdf', 50);
        \Illuminate\Support\Facades\Storage::disk('local')->putFileAs('documents', $file, 'test.pdf');

        \App\Modules\Document\Domain\Models\Document::query()->create([
            'user_id' => $colaborador->id,
            'document_type_id' => $type->id,
            'original_name' => 'rg.pdf',
            'stored_name' => 'documents/test.pdf',
        ]);

        $response = $this->actingAs($admin)->getJson("/api/users/{$colaborador->id}/documents");

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.original_name', 'rg.pdf');
    });

    it('deletes a document', function () {
        $admin = createUserWithRole();
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab3@test.com']);
        $type = DocumentType::query()->create(['name' => 'CPF']);

        \Illuminate\Support\Facades\Storage::fake('local');
        $file = \Illuminate\Http\UploadedFile::fake()->create('cpf.pdf', 50);
        \Illuminate\Support\Facades\Storage::disk('local')->putFileAs('documents', $file, 'test2.pdf');

        $document = \App\Modules\Document\Domain\Models\Document::query()->create([
            'user_id' => $colaborador->id,
            'document_type_id' => $type->id,
            'original_name' => 'cpf.pdf',
            'stored_name' => 'documents/test2.pdf',
        ]);

        $response = $this->actingAs($admin)->deleteJson("/api/documents/{$document->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('documents', ['id' => $document->id]);
    });

    it('denies upload without permission', function () {
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab4@test.com']);
        $type = DocumentType::query()->create(['name' => 'Teste']);

        $this->actingAs($colaborador)
            ->postJson("/api/users/{$colaborador->id}/documents", [
                'document_type_id' => $type->id,
                'file' => \Illuminate\Http\UploadedFile::fake()->create('teste.pdf', 50),
            ])
            ->assertForbidden();
    });

    it('allows nullable expiration date', function () {
        $admin = createUserWithRole();
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab5@test.com']);
        $type = DocumentType::query()->create(['name' => 'Certidão']);

        \Illuminate\Support\Facades\Storage::fake('local');

        $response = $this->actingAs($admin)->postJson(
            "/api/users/{$colaborador->id}/documents",
            [
                'document_type_id' => $type->id,
                'file' => \Illuminate\Http\UploadedFile::fake()->create('certidao.pdf', 50),
            ],
        );

        $response->assertCreated()
            ->assertJsonPath('data.expiration_date', null);
    });
});
