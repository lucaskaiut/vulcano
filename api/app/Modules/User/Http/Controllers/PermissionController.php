<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Enums\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = array_map(
            fn (Permission $p) => [
                'id' => $p->value,
                'name' => $p->label(),
                'slug' => $p->value,
                'description' => $p->description(),
            ],
            Permission::cases(),
        );

        return response()->json([
            'data' => $permissions,
            'meta' => ['total' => count($permissions)],
        ]);
    }
}
