<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\Legacy\LegacyApiClient;
use App\Http\Controllers\Controller;

class LegacyPeriodController extends Controller
{
    public function __construct(
        private LegacyApiClient $legacyApiService
    ) {}

    public function index()
    {
        $periods = $this->legacyApiService->fetchLegacyPeriods();

        return $this->success($periods, 'Legacy periods retrieved successfully');
    }
}
