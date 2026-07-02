<?php

namespace App\Modules\User\Domain\Support;

enum FilterType: string
{
    case Like = 'like';
    case Search = 'search';
    case DateGreaterThanOrEqual = 'date_gte';
    case DateLessThanOrEqual = 'date_lte';
    case NumericGreaterThanOrEqual = 'numeric_gte';
    case NumericLessThanOrEqual = 'numeric_lte';
    case NotEqual = 'not_equal';
    case Equals = 'equals';
}
