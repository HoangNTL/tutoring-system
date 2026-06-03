<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use Illuminate\Database\Eloquent\Collection;

class StudentTutorialPeriodService
{
    public function __construct(
        private TutorialPeriodAcademicPeriodResolver $academicPeriodResolver
    ) {}

    /**
     * @return Collection<int, TutorialPeriod>
     */
    public function getOpenTutorialPeriods(): Collection
    {
        $tutorialPeriods = TutorialPeriod::query()
            ->where('status', TutorialPeriodStatus::OPEN)
            ->orderByDesc('registration_start_at')
            ->get();

        $this->academicPeriodResolver->enrichCollection($tutorialPeriods);

        return $tutorialPeriods;
    }
}
