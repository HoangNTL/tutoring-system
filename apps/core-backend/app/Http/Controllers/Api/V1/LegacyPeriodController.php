<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\External\LegacyApiService;

class LegacyPeriodController extends Controller
{
    public function __construct(
        private LegacyApiService $legacyApiService
    ) {}

    public function index()
    {
        $periods = $this->legacyApiService->fetchLegacyPeriods();

        return $this->success($periods, 'Legacy periods retrieved successfully');
    }
}
