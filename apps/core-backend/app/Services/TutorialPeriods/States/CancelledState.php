<?php

namespace App\Services\TutorialPeriods\States;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class CancelledState extends TutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::CANCELLED;
    }

    public function cancel(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException('This tutorial period cannot be cancelled');
    }

    public function restore(TutorialPeriod $tutorialPeriod, TutorialPeriodStatus $targetStatus): void
    {
        if ($tutorialPeriod->has_entered_ongoing) {
            throw new ConflictHttpException('Cannot restore a tutorial period that has entered ONGOING status');
        }

        $allowedTargets = [TutorialPeriodStatus::DRAFT, TutorialPeriodStatus::OPEN];

        if (!in_array($targetStatus, $allowedTargets, true)) {
            throw new ConflictHttpException('Cancelled tutorial periods can only be restored to DRAFT or OPEN');
        }

        $tutorialPeriod->update([
            'status' => $targetStatus->value,
        ]);
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
            'canRestore' => !$tutorialPeriod->has_entered_ongoing,
        ];
    }
}
