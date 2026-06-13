<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\LegacyDataGateway;
use App\Http\Controllers\Controller;

class LegacyPeriodController extends Controller
{
    public function __construct(
        private LegacyDataGateway $legacyDataGateway
    ) {}

    public function index()
    {
        $periods = $this->legacyDataGateway->fetchLegacyPeriods();

        return $this->success($periods, 'Legacy periods retrieved successfully');
    }
}
