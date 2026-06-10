<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;

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
            'status' => $this->resolveStatusValue($data['status'] ?? TutorialPeriodStatus::DRAFT),
            'created_by' => $userId,
        ]);

        $tutorialPeriod->load('createdBy');
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function update(int $id, array $data): TutorialPeriod
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFailWithCounts($id, ['createdBy']);
        $this->tutorialPeriodStatusService->validateUpdate($tutorialPeriod, $data);

        $attributes = $this->extractTutorialPeriodAttributes($data);
        $tutorialPeriod->update($attributes);

        $tutorialPeriod = $tutorialPeriod->refresh()->load('createdBy')->loadCount(['registrations', 'classes']);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    public function delete(int $id): void
    {
        $tutorialPeriod = $this->tutorialPeriodQueryService->findOrFailWithCounts($id);
        $this->tutorialPeriodStatusService->ensureDeletable($tutorialPeriod);

        $tutorialPeriod->delete();
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
            'status',
        ] as $key) {
            if (array_key_exists($key, $data)) {
                $attributes[$key] = $key === 'status'
                    ? $this->resolveStatusValue($data[$key])
                    : $data[$key];
            }
        }

        return $attributes;
    }

    private function resolveStatusValue(mixed $value): mixed
    {
        if ($value instanceof TutorialPeriodStatus) {
            return $value->value;
        }

        $normalized = strtoupper(trim((string) $value));

        foreach (TutorialPeriodStatus::cases() as $status) {
            if ($status->name === $normalized) {
                return $status->value;
            }
        }

        return $value;
    }
}
