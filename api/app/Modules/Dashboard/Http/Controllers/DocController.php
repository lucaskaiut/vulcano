<?php

namespace App\Modules\Dashboard\Http\Controllers;

class DocController extends \App\Http\Controllers\Controller
{
    public function guide(): string
    {
        return file_get_contents(resource_path('docs/user-guide.md'));
    }
}
