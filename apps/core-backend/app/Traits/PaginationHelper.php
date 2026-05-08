<?php

namespace App\Traits;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

trait PaginationHelper
{
    protected function formatPaginator(LengthAwarePaginator $paginator): array
    {
        return [
            'items' => $paginator->items(),
            'meta'  => [
                'total'       => $paginator->total(),
                'perPage'     => $paginator->perPage(),
                'currentPage' => $paginator->currentPage(),
                'lastPage'    => $paginator->lastPage(),
            ]
        ];
    }
}
