<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentTutorialRegistrationInfoResource;
use App\Models\TutorialRegistration;
use App\Services\TutorialPeriods\StudentTutorialRegistrationInfoService;
use Illuminate\Http\Request;

class StudentTutorialRegistrationInfoController extends Controller
{
    public function __construct(
        private StudentTutorialRegistrationInfoService $studentTutorialRegistrationInfoService,
    ) {}

    public function show(Request $request, int $tutorialPeriodId)
    {
        $this->authorize("viewInfo", TutorialRegistration::class);

        $registrationInfo = $this->studentTutorialRegistrationInfoService->getRegistrationInfo(
            $request->user(),
            $tutorialPeriodId,
        );

        return $this->success(
            new StudentTutorialRegistrationInfoResource($registrationInfo),
            "Tutorial registration information retrieved successfully",
        );
    }
}
