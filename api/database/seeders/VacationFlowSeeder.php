<?php

namespace Database\Seeders;

use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use Illuminate\Database\Seeder;

class VacationFlowSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Criando usuários de teste...');

        $colaboradorRole = Role::where('name', 'Colaborador')->firstOrFail();
        $gestorRole = Role::where('name', 'Gestor')->firstOrFail();
        $rhRole = Role::where('name', 'RH')->firstOrFail();
        $adminRole = Role::where('name', 'Administrador')->firstOrFail();

        $colaborador = User::factory()->create([
            'name' => 'Ana Colaboradora',
            'email' => 'ana@vulcano.teste',
            'password' => 'password',
            'job_title' => 'Desenvolvedora',
            'hired_at' => '2024-01-15',
            'salary' => 8000,
        ]);
        $colaborador->roles()->attach($colaboradorRole);

        $gestor = User::factory()->create([
            'name' => 'Carlos Gestor',
            'email' => 'carlos@vulcano.teste',
            'password' => 'password',
            'job_title' => 'Gerente de TI',
            'hired_at' => '2023-03-01',
            'salary' => 15000,
            'manager_id' => null,
        ]);
        $gestor->roles()->attach($gestorRole);

        $rh = User::factory()->create([
            'name' => 'Mariana RH',
            'email' => 'mariana@vulcano.teste',
            'password' => 'password',
            'job_title' => 'Analista de RH',
            'hired_at' => '2022-06-10',
            'salary' => 9000,
        ]);
        $rh->roles()->attach($rhRole);

        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@vulcano.teste',
            'password' => 'password',
            'job_title' => 'Administrador',
            'hired_at' => '2021-01-01',
            'salary' => 20000,
        ]);
        $admin->roles()->attach($adminRole);

        $this->command?->info('Criando saldos de férias...');

        VacationBalance::query()->create([
            'user_id' => $colaborador->id,
            'available_days' => 30,
            'accrued_days' => 30,
            'used_days' => 0,
            'additional_days' => 0,
        ]);

        VacationBalance::query()->create([
            'user_id' => $gestor->id,
            'available_days' => 30,
            'accrued_days' => 30,
            'used_days' => 0,
            'additional_days' => 0,
        ]);

        VacationBalance::query()->create([
            'user_id' => $rh->id,
            'available_days' => 30,
            'accrued_days' => 30,
            'used_days' => 0,
            'additional_days' => 0,
        ]);

        VacationBalance::query()->create([
            'user_id' => $admin->id,
            'available_days' => 30,
            'accrued_days' => 30,
            'used_days' => 0,
            'additional_days' => 0,
        ]);

        $this->command?->info('Configurando workflow de férias...');

        WorkflowStep::query()->where('workflow_type', 'vacation_request')->delete();

        WorkflowStep::query()->create([
            'workflow_type' => 'vacation_request',
            'name' => 'Gestor',
            'order' => 1,
            'visibility_rules' => [
                ['type' => 'manager'],
            ],
            'approval_rules' => [
                ['type' => 'manager'],
            ],
        ]);

        WorkflowStep::query()->create([
            'workflow_type' => 'vacation_request',
            'name' => 'RH',
            'order' => 2,
            'visibility_rules' => [
                ['type' => 'manager'],
                ['type' => 'role', 'id' => $rhRole->id],
            ],
            'approval_rules' => [
                ['type' => 'role', 'id' => $rhRole->id],
            ],
        ]);

        $this->command?->info('Configurando workflow de comissão...');

        $financeiroRole = Role::where('name', 'Financeiro')->firstOrFail();

        WorkflowStep::query()->where('workflow_type', 'commission')->delete();

        WorkflowStep::query()->create([
            'workflow_type' => 'commission',
            'name' => 'Gestor',
            'order' => 1,
            'visibility_rules' => [
                ['type' => 'manager'],
            ],
            'approval_rules' => [
                ['type' => 'manager'],
            ],
        ]);

        WorkflowStep::query()->create([
            'workflow_type' => 'commission',
            'name' => 'Financeiro',
            'order' => 2,
            'visibility_rules' => [
                ['type' => 'manager'],
                ['type' => 'role', 'id' => $financeiroRole->id],
            ],
            'approval_rules' => [
                ['type' => 'role', 'id' => $financeiroRole->id],
            ],
        ]);

        $this->command?->info('Seed de teste concluído!');
    }
}
