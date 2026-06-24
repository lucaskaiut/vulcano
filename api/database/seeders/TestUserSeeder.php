<?php

namespace Database\Seeders;

use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Models\User;
use Illuminate\Database\Seeder;

class TestUserSeeder extends Seeder
{
    public const EMAIL = 'test@example.com';

    public const PASSWORD = 'password';

    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => self::EMAIL],
            [
                'name' => 'Test User',
                'job_title' => 'Administrador',
                'hired_at' => now()->toDateString(),
                'salary' => 10000,
                'password' => self::PASSWORD,
            ],
        );

        $adminRole = Role::query()->where('name', 'Administrador')->first();

        if ($adminRole) {
            $user->roles()->syncWithoutDetaching([$adminRole->id]);
        }
    }
}
