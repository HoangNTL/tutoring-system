<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TutorialPeriod\ListTutorialPeriodsRequest;
use App\Http\Requests\TutorialPeriod\StoreTutorialPeriodRequest;
use App\Http\Requests\TutorialPeriod\UpdateTutorialPeriodRequest;
use App\Http\Resources\TutorialPeriodResource;
use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use App\Services\TutorialPeriods\TutorialPeriodService;
use Illuminate\Http\Request;

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

    public function open(TutorialPeriod $tutorial_period)
    {
        $this->authorize('open', $tutorial_period);

        $tutorialPeriod = $this->tutorialPeriodService->open($tutorial_period->id);

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period opened successfully'
        );
    }

    public function cancel(TutorialPeriod $tutorial_period)
    {
        $this->authorize('cancel', $tutorial_period);

        $tutorialPeriod = $this->tutorialPeriodService->cancel($tutorial_period->id);

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period cancelled successfully'
        );
    }

    public function assigning(TutorialPeriod $tutorial_period)
    {
        $this->authorize('assigning', $tutorial_period);

        $tutorialPeriod = $this->tutorialPeriodService->assigning($tutorial_period->id);

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period moved to assigning successfully'
        );
    }

    public function ongoing(TutorialPeriod $tutorial_period)
    {
        $this->authorize('ongoing', $tutorial_period);

        $tutorialPeriod = $this->tutorialPeriodService->ongoing($tutorial_period->id);

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period moved to ongoing successfully'
        );
    }

    public function close(TutorialPeriod $tutorial_period)
    {
        $this->authorize('close', $tutorial_period);

        $tutorialPeriod = $this->tutorialPeriodService->close($tutorial_period->id);

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period closed successfully'
        );
    }

    public function revertToDraft(TutorialPeriod $tutorial_period)
    {
        $this->authorize('revertToDraft', $tutorial_period);

        $tutorialPeriod = $this->tutorialPeriodService->revertToDraft($tutorial_period->id);

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period reverted to draft successfully'
        );
    }

    public function reopenRegistration(TutorialPeriod $tutorial_period)
    {
        $this->authorize('reopenRegistration', $tutorial_period);

        $tutorialPeriod = $this->tutorialPeriodService->reopenRegistration($tutorial_period->id);

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period reopened for registration successfully'
        );
    }

    public function restore(Request $request, TutorialPeriod $tutorial_period)
    {
        $this->authorize('restore', $tutorial_period);

        $targetStatusName = $request->input('targetStatus', 'DRAFT');
        $targetStatus = TutorialPeriodStatus::tryFrom(
            match (strtoupper($targetStatusName)) {
                'DRAFT' => TutorialPeriodStatus::DRAFT->value,
                'OPEN' => TutorialPeriodStatus::OPEN->value,
                default => -1,
            }
        );

        if ($targetStatus === null) {
            return $this->error('targetStatus must be DRAFT or OPEN', 422);
        }

        $tutorialPeriod = $this->tutorialPeriodService->restore($tutorial_period->id, $targetStatus);

        return $this->success(
            new TutorialPeriodResource($tutorialPeriod),
            'Tutorial period restored successfully'
        );
    }
}
