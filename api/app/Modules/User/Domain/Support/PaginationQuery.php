<?php

namespace App\Modules\User\Domain\Support;

use Illuminate\Http\Request;

class PaginationQuery
{
    public const DEFAULT_PER_PAGE = 15;

    /** @var list<int> */
    public const ALLOWED_PER_PAGE = [10, 15, 25, 50];

    public function __construct(
        public readonly int $page,
        public readonly int $perPage,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = (int) $request->query('per_page', self::DEFAULT_PER_PAGE);

        if (! in_array($perPage, self::ALLOWED_PER_PAGE, true)) {
            $perPage = self::DEFAULT_PER_PAGE;
        }

        return new self($page, $perPage);
    }
}
