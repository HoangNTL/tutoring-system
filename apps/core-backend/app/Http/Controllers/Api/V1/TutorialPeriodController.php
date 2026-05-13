<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TutorialPeriod\ListTutorialPeriodsRequest;
use App\Http\Requests\TutorialPeriod\StoreTutorialPeriodRequest;
use App\Http\Requests\TutorialPeriod\UpdateTutorialPeriodRequest;
use App\Http\Resources\TutorialPeriodResource;
use App\Models\TutorialPeriod;
use App\Services\TutorialPeriodService;
use Illuminate\Http\Request;

class TutorialPeriodController extends Controller
{
    public function __construct(
        private TutorialPeriodService $tutorialPeriodService
    ) {
    }

    public function index(ListTutorialPeriodsRequest $request)
    {
        $result = $this->tutorialPeriodService->getAll($request->validated());

        return $this->success(
            collect($result['items'])
                ->map(fn ($tutorialPeriod) => (new TutorialPeriodResource($tutorialPeriod))->resolve())
                ->all(),
            'Tutorial periods retrieved successfully',
            $result['meta']
        );
    }

    public function show(TutorialPeriod $tutorial_period)
    {
        $tutorialPeriod = $this->tutorialPeriodService->getById($tutorial_period->id);

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period retrieved successfully'
        );
    }

    public function store(StoreTutorialPeriodRequest $request)
    {
        $tutorialPeriod = $this->tutorialPeriodService->create(
            $request->validated(),
            $request->user()->id
        );

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period created successfully',
            null,
            201
        );
    }

    public function update(UpdateTutorialPeriodRequest $request, TutorialPeriod $tutorial_period)
    {
        $tutorialPeriod = $this->tutorialPeriodService->update($tutorial_period->id, $request->validated());

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period updated successfully'
        );
    }

    public function destroy(TutorialPeriod $tutorial_period)
    {
        $this->tutorialPeriodService->delete($tutorial_period->id);

        return $this->success(null, 'Tutorial period deleted successfully');
    }

    public function open(Request $request, TutorialPeriod $tutorial_period)
    {
        $tutorialPeriod = $this->tutorialPeriodService->open($tutorial_period->id, $request->user()->id);

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period opened successfully'
        );
    }

    public function assigning(Request $request, TutorialPeriod $tutorial_period)
    {
        $tutorialPeriod = $this->tutorialPeriodService->assigning($tutorial_period->id, $request->user()->id);

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period moved to assigning successfully'
        );
    }

    public function ongoing(Request $request, TutorialPeriod $tutorial_period)
    {
        $tutorialPeriod = $this->tutorialPeriodService->ongoing($tutorial_period->id, $request->user()->id);

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period moved to ongoing successfully'
        );
    }

    public function close(Request $request, TutorialPeriod $tutorial_period)
    {
        $tutorialPeriod = $this->tutorialPeriodService->close($tutorial_period->id, $request->user()->id);

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period closed successfully'
        );
    }
}
