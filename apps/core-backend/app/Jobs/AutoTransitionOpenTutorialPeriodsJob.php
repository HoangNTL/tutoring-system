<?php

namespace App\Jobs;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use App\Services\TutorialPeriodService;
use Illuminate\Support\Facades\Date;

class AutoTransitionOpenTutorialPeriodsJob
{
    public function handle(TutorialPeriodService $tutorialPeriodService): void
    {
        TutorialPeriod::query()
            ->where('status', TutorialPeriodStatus::OPEN->value)
            ->whereDate('end_reg_date', '<', Date::today())
            ->orderBy('id')
            ->chunkById(100, function ($tutorialPeriods) use ($tutorialPeriodService): void {
                foreach ($tutorialPeriods as $tutorialPeriod) {
                    $tutorialPeriodService->assigning(
                        $tutorialPeriod->id,
                        $tutorialPeriod->created_by
                    );
                }
            });
    }
}
