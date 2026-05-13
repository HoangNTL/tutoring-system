<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TutorialPeriod\ListTutorialPeriodsRequest;
use App\Http\Requests\TutorialPeriod\StoreTutorialPeriodRequest;
use App\Http\Requests\TutorialPeriod\UpdateTutorialPeriodRequest;
use App\Http\Resources\TutorialPeriodResource;
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

    public function show(int $id)
    {
        $tutorialPeriod = $this->tutorialPeriodService->getById($id);

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

    public function update(UpdateTutorialPeriodRequest $request, int $id)
    {
        $tutorialPeriod = $this->tutorialPeriodService->update($id, $request->validated());

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period updated successfully'
        );
    }

    public function destroy(int $id)
    {
        $this->tutorialPeriodService->delete($id);

        return $this->success(null, 'Tutorial period deleted successfully');
    }

    public function open(Request $request, int $id)
    {
        $tutorialPeriod = $this->tutorialPeriodService->open($id, $request->user()->id);

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period opened successfully'
        );
    }

    public function assigning(Request $request, int $id)
    {
        $tutorialPeriod = $this->tutorialPeriodService->assigning($id, $request->user()->id);

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period moved to assigning successfully'
        );
    }

    public function ongoing(Request $request, int $id)
    {
        $tutorialPeriod = $this->tutorialPeriodService->ongoing($id, $request->user()->id);

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period moved to ongoing successfully'
        );
    }

    public function close(Request $request, int $id)
    {
        $tutorialPeriod = $this->tutorialPeriodService->close($id, $request->user()->id);

        return $this->success(
            (new TutorialPeriodResource($tutorialPeriod))->resolve(),
            'Tutorial period closed successfully'
        );
    }
}
