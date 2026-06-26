<?php

describe('medical exams', function () {
    it('registers an exam for a collaborator', function () {
        $admin = createUserWithRole();
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab@exam.test']);

        $response = $this->actingAs($admin)->postJson("/api/users/{$colaborador->id}/medical-exams", [
            'exam_type' => 'ASO',
            'execution_date' => '2026-06-01',
            'expiration_date' => '2027-06-01',
            'notes' => 'Exame admissional',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.exam_type', 'ASO')
            ->assertJsonPath('data.notes', 'Exame admissional');

        $this->assertDatabaseHas('medical_exams', [
            'user_id' => $colaborador->id,
            'exam_type' => 'ASO',
        ]);
    });

    it('lists exams for a user', function () {
        $admin = createUserWithRole();
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab2@exam.test']);

        \App\Modules\MedicalExam\Domain\Models\MedicalExam::query()->create([
            'user_id' => $colaborador->id,
            'exam_type' => 'Audiometria',
            'execution_date' => '2026-05-01',
            'expiration_date' => '2027-05-01',
        ]);

        $response = $this->actingAs($admin)->getJson("/api/users/{$colaborador->id}/medical-exams");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.exam_type', 'Audiometria');
    });

    it('updates an exam', function () {
        $admin = createUserWithRole();
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab3@exam.test']);

        $exam = \App\Modules\MedicalExam\Domain\Models\MedicalExam::query()->create([
            'user_id' => $colaborador->id,
            'exam_type' => 'ASO',
            'execution_date' => '2026-01-01',
            'expiration_date' => '2027-01-01',
        ]);

        $response = $this->actingAs($admin)->putJson("/api/medical-exams/{$exam->id}", [
            'expiration_date' => '2027-06-01',
        ]);

        $response->assertOk()->assertJsonPath('data.expiration_date', '2027-06-01');
    });

    it('deletes an exam', function () {
        $admin = createUserWithRole();
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab4@exam.test']);

        $exam = \App\Modules\MedicalExam\Domain\Models\MedicalExam::query()->create([
            'user_id' => $colaborador->id,
            'exam_type' => 'ASO',
            'execution_date' => '2026-01-01',
            'expiration_date' => '2027-01-01',
        ]);

        $response = $this->actingAs($admin)->deleteJson("/api/medical-exams/{$exam->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('medical_exams', ['id' => $exam->id]);
    });

    it('validates expiration after execution date', function () {
        $admin = createUserWithRole();
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab5@exam.test']);

        $this->actingAs($admin)
            ->postJson("/api/users/{$colaborador->id}/medical-exams", [
                'exam_type' => 'ASO',
                'execution_date' => '2026-06-01',
                'expiration_date' => '2025-01-01',
            ])
            ->assertUnprocessable();
    });

    it('denies access without permission', function () {
        $colaborador = createUserWithRole('Colaborador', ['email' => 'colab6@exam.test']);

        // Colaborador has medical_exams.view but not medical_exams.create
        $this->actingAs($colaborador)
            ->postJson("/api/users/{$colaborador->id}/medical-exams", [
                'exam_type' => 'ASO',
                'execution_date' => '2026-06-01',
                'expiration_date' => '2027-06-01',
            ])
            ->assertForbidden();
    });
});
