<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workflow_steps', function (Blueprint $table) {
            $table->json('visibility_rules')->nullable()->after('order');
            $table->json('approval_rules')->nullable()->after('visibility_rules');
        });

        DB::table('workflow_steps')
            ->whereNotNull('responsible_role_id')
            ->orWhereNotNull('responsible_user_id')
            ->orderBy('id')
            ->each(function ($step) {
                $visibility = [];
                $approval = [];

                if ($step->responsible_role_id) {
                    $visibility[] = ['type' => 'role', 'id' => (int) $step->responsible_role_id];
                    $approval[] = ['type' => 'role', 'id' => (int) $step->responsible_role_id];
                }

                if ($step->responsible_user_id) {
                    $visibility[] = ['type' => 'user', 'id' => (int) $step->responsible_user_id];
                    $approval[] = ['type' => 'user', 'id' => (int) $step->responsible_user_id];
                }

                DB::table('workflow_steps')
                    ->where('id', $step->id)
                    ->update([
                        'visibility_rules' => json_encode($visibility),
                        'approval_rules' => json_encode($approval),
                    ]);
            });

        Schema::table('workflow_steps', function (Blueprint $table) {
            $table->dropForeign(['responsible_role_id']);
            $table->dropForeign(['responsible_user_id']);
            $table->dropColumn(['responsible_role_id', 'responsible_user_id']);
        });
    }

    public function down(): void
    {
        Schema::table('workflow_steps', function (Blueprint $table) {
            $table->foreignId('responsible_role_id')->nullable()->after('order')->constrained('roles')->nullOnDelete();
            $table->foreignId('responsible_user_id')->nullable()->after('responsible_role_id')->constrained('users')->nullOnDelete();
        });

        DB::table('workflow_steps')->orderBy('id')->each(function ($step) {
            $visibility = $step->visibility_rules ? json_decode($step->visibility_rules, true) : [];

            $roleId = null;
            $userId = null;

            foreach ($visibility as $rule) {
                if ($rule['type'] === 'role' && ! $roleId) {
                    $roleId = $rule['id'];
                }
                if ($rule['type'] === 'user' && ! $userId) {
                    $userId = $rule['id'];
                }
            }

            DB::table('workflow_steps')
                ->where('id', $step->id)
                ->update([
                    'responsible_role_id' => $roleId,
                    'responsible_user_id' => $userId,
                ]);
        });

        Schema::table('workflow_steps', function (Blueprint $table) {
            $table->dropColumn(['visibility_rules', 'approval_rules']);
        });
    }
};
