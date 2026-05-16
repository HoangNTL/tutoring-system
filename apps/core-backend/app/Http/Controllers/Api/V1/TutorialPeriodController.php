<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TutorialPeriod\ListTutorialPeriodsRequest;
use App\Http\Requests\TutorialPeriod\StoreTutorialPeriodRequest;
use App\Http\Requests\TutorialPeriod\UpdateTutorialPeriodRequest;
use App\Http\Requests\TutorialPeriod\UpdateTutorialPeriodStatusRequest;
use App\Http\Resources\TutorialPeriodResource;
use App\Models\TutorialPeriod;
use App\Services\TutorialPeriodService;

class TutorialPeriodController extends Controller
{
    public function __construct(
        private TutorialPeriodService $tutorialPeriodService
    ) {}

    public function index(ListTutorialPeriodsRequest $request)
    {
        $this->authorize('viewAny', TutorialPeriod::class);

        $result = $this->tutorialPeriodService->getAll($request->validated());

        return $this->success(
            TutorialPeriodResource::collection(collect($result['items'])),
            'Tutorial periods retrieved successfully',
            $result['meta']
        );
    }

    public function show(TutorialPeriod $tutorial_period)
    {
        $this->authorize('view', $tutorial_period);

        $tutorialPeriod = $this->tutorialPeriodService->getById($tutorial_period->id);

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period retrieved successfully'
        );
    }

    public function store(StoreTutorialPeriodRequest $request)
    {
        $this->authorize('create', TutorialPeriod::class);

        $tutorialPeriod = $this->tutorialPeriodService->create(
            $request->validated(),
            (int) $request->user()->id
        );

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period created successfully',
            null,
            201
        );
    }

    public function update(UpdateTutorialPeriodRequest $request, TutorialPeriod $tutorial_period)
    {
        $this->authorize('update', $tutorial_period);

        $tutorialPeriod = $this->tutorialPeriodService->update($tutorial_period->id, $request->validated());

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period updated successfully'
        );
    }

    public function destroy(TutorialPeriod $tutorial_period)
    {
        $this->authorize('delete', $tutorial_period);

        $this->tutorialPeriodService->delete($tutorial_period->id);

        return $this->success(null, 'Tutorial period deleted successfully');
    }

    public function updateStatus(UpdateTutorialPeriodStatusRequest $request, TutorialPeriod $tutorial_period)
    {
        $this->authorize('update', $tutorial_period);

        $validated = $request->validated();
        $tutorialPeriod = $this->tutorialPeriodService->updateStatus(
            $tutorial_period->id,
            (string) $validated['status'],
            (int) $request->user()->id
        );

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period status updated successfully'
        );
    }
}
