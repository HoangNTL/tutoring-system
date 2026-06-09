<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserScheduleResource;
use App\Services\TutorialPeriods\UserScheduleService;
use Illuminate\Http\Request;

class LecturerScheduleController extends Controller
{
    public function __construct(
        private UserScheduleService $userScheduleService
    ) {}

    public function index(Request $request)
    {
        $schedules = $this->userScheduleService->getLecturerSchedules($request->user());

        return $this->success(
            UserScheduleResource::collection($schedules),
            'Lecturer schedules retrieved successfully'
        );
    }
}
