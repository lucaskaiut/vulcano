<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $steps = DB::table('workflow_steps')->select('id', 'visibility_rules', 'approval_rules')->get();

        foreach ($steps as $step) {
            $updates = [];

            foreach (['visibility_rules', 'approval_rules'] as $column) {
                $raw = $step->{$column};

                if ($raw === null || $raw === '') {
                    continue;
                }

                $decoded = json_decode($raw, true);

                // Valor legado double-encoded: primeira decode devolve string JSON
                if (is_string($decoded)) {
                    $inner = json_decode($decoded, true);

                    if (is_array($inner)) {
                        $updates[$column] = $decoded;
                    }
                }
            }

            if ($updates !== []) {
                DB::table('workflow_steps')->where('id', $step->id)->update($updates);
            }
        }
    }

    public function down(): void
    {
        // Irreversível de forma segura — dados já estava inconsistentes
    }
};
