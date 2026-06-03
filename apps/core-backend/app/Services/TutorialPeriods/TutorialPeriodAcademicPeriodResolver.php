<?php

namespace App\Services\TutorialPeriods;

use App\Models\TutorialPeriod;
use App\Services\External\LegacyApiService;
use Illuminate\Support\Facades\Log;
use Throwable;

class TutorialPeriodAcademicPeriodResolver
{
    public function __construct(
        private LegacyApiService $legacyApiService
    ) {}

    public function enrich(TutorialPeriod $tutorialPeriod): void
    {
        $this->enrichCollection([$tutorialPeriod]);
    }

    /**
     * @param  iterable<int, TutorialPeriod>  $tutorialPeriods
     */
    public function enrichCollection(iterable $tutorialPeriods): void
    {
        $tutorialPeriods = collect($tutorialPeriods)
            ->filter(static fn($tutorialPeriod) => $tutorialPeriod instanceof TutorialPeriod)
            ->values()
            ->all();

        if ($tutorialPeriods === []) {
            return;
        }

        $academicPeriodIds = collect($tutorialPeriods)
            ->pluck('academic_period_id')
            ->filter(static fn($id) => $id !== null)
            ->map(static fn($id) => (int) $id)
            ->unique()
            ->values();

        if ($academicPeriodIds->isEmpty()) {
            $this->clearAcademicPeriods($tutorialPeriods);

            return;
        }

        try {
            $periodsById = collect($this->legacyApiService->fetchLegacyPeriods())
                ->keyBy('id');
        } catch (Throwable $exception) {
            Log::warning('Failed to enrich tutorial periods with legacy academic period data', [
                'error' => $exception->getMessage(),
            ]);

            $this->clearAcademicPeriods($tutorialPeriods);

            return;
        }

        foreach ($tutorialPeriods as $tutorialPeriod) {
            $academicPeriodId = $tutorialPeriod->academic_period_id;

            $tutorialPeriod->setAcademicPeriod(
                $academicPeriodId !== null ? $periodsById->get((int) $academicPeriodId) : null
            );
        }
    }

    /**
     * @param  array<int, TutorialPeriod>  $tutorialPeriods
     */
    private function clearAcademicPeriods(array $tutorialPeriods): void
    {
        foreach ($tutorialPeriods as $tutorialPeriod) {
            $tutorialPeriod->setAcademicPeriod(null);
        }
    }
}
