<?php

namespace App\Console\Commands;

use App\Services\TutorialPeriods\TutorialPeriodService;
use Illuminate\Console\Command;

class UpdateTutorialPeriodStatuses extends Command
{
    protected $signature = 'tutorial-periods:update-statuses';

    protected $description = 'Update tutorial period statuses based on registration and study dates.';

    public function handle(TutorialPeriodService $tutorialPeriodService): int
    {
        $result = $tutorialPeriodService->updateExpiredStatuses();

        $this->info(sprintf(
            'Updated tutorial periods: OPEN->ASSIGNING=%d, ASSIGNING->ONGOING=%d, ONGOING->CLOSED=%d',
            $result['open_to_assigning'],
            $result['assigning_to_ongoing'],
            $result['ongoing_to_closed'],
        ));

        return self::SUCCESS;
    }
}
