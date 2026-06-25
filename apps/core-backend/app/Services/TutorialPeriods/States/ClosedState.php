<?php

namespace App\Services\TutorialPeriods\States;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class ClosedState extends TutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::CLOSED;
    }

    public function cancel(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException('This tutorial period cannot be cancelled');
    }

    public function getPermissions(TutorialPeriod $tutorialPeriod): array
    {
        return [
            'canEdit' => false,
            'canDelete' => true,
            'canOpen' => false,
            'canAssigning' => false,
            'canOngoing' => false,
            'canClose' => false,
            'canCancel' => false,
            'canRevertToDraft' => false,
            'canReopenRegistration' => false,
            'canRestore' => false,
        ];
    }
}
