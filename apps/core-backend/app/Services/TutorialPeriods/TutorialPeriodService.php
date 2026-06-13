<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class TutorialPeriodService
{
    public function __construct(
        private TutorialPeriodAcademicPeriodResolver $academicPeriodResolver,
        private TutorialPeriodQueryService $tutorialPeriodQueryService,
        private TutorialPeriodStatusService $tutorialPeriodStatusService,
    ) {}

    public function getAll(array $filters): array
    {
        return $this->tutorialPeriodQueryService->getAll($filters);
    }

    public function getById(int $id): TutorialPeriod
    {
        return $this->tutorialPeriodQueryService->getById($id);
    }

    public function create(array $data, int $userId): TutorialPeriod
    {
        $tutorialPeriod = TutorialPeriod::create([
            ...$this->extractTutorialPeriodAttributes($data),
            'status' => TutorialPeriodStatus::DRAFT->value,
            'created_by' => $userId,
        ]);

        $tutorialPeriod->load('createdBy');
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function update(int $id, array $data): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id, ['createdBy']);

        $editableFields = $this->tutorialPeriodStatusService->getEditableFields($tutorialPeriod->status);

        if (empty($editableFields)) {
            throw new ConflictHttpException('This tutorial period cannot be edited in its current status');
        }

        $allAttributes = $this->extractTutorialPeriodAttributes($data);
        $attributes = array_intersect_key($allAttributes, array_flip($editableFields));

        if (!empty($attributes)) {
            $tutorialPeriod->update($attributes);
        }

        $tutorialPeriod = $tutorialPeriod->refresh()->load('createdBy');
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function delete(int $id): void
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id);
        $this->tutorialPeriodStatusService->ensureDraftStatus($tutorialPeriod, 'deleted');

        $tutorialPeriod->delete();
    }

    public function open(int $id): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id);
        $tutorialPeriod = $this->tutorialPeriodStatusService->open($tutorialPeriod);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function cancel(int $id): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id);
        $tutorialPeriod = $this->tutorialPeriodStatusService->cancel($tutorialPeriod);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function assigning(int $id): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id);
        $tutorialPeriod = $this->tutorialPeriodStatusService->assigning($tutorialPeriod);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function ongoing(int $id): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id);
        $tutorialPeriod = $this->tutorialPeriodStatusService->ongoing($tutorialPeriod);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function close(int $id): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id);
        $tutorialPeriod = $this->tutorialPeriodStatusService->close($tutorialPeriod);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function revertToDraft(int $id): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id);
        $tutorialPeriod = $this->tutorialPeriodStatusService->revertToDraft($tutorialPeriod);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function reopenRegistration(int $id): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id);
        $tutorialPeriod = $this->tutorialPeriodStatusService->reopenRegistration($tutorialPeriod);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function restore(int $id, TutorialPeriodStatus $targetStatus): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFail($id);
        $tutorialPeriod = $this->tutorialPeriodStatusService->restore($tutorialPeriod, $targetStatus);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    /**
     * @return array{open_to_assigning:int,assigning_to_ongoing:int,ongoing_to_closed:int}
     */
    public function updateExpiredStatuses(): array
    {
        return $this->tutorialPeriodStatusService->updateExpiredStatuses();
    }

    /**
     * @return array<string, mixed>
     */
    private function extractTutorialPeriodAttributes(array $data): array
    {
        $attributes = [];

        foreach ([
            'academic_period_id',
            'title',
            'description',
            'registration_start_at',
            'registration_end_at',
            'study_start_at',
            'study_end_at',
        ] as $key) {
            if (array_key_exists($key, $data)) {
                $attributes[$key] = $data[$key];
            }
        }

        return $attributes;
    }
}
