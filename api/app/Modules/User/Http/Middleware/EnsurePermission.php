<?php

namespace App\Modules\User\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    /** @param  Closure(Request): Response  $next */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasAnyPermission($permissions)) {
            abort(403, 'Acesso negado.');
        }

        return $next($request);
    }
}
