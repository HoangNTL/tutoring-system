<?php

namespace App\Services\TutorialPeriods\States;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class OpenState extends TutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::OPEN;
    }

    public function assigning(TutorialPeriod $tutorialPeriod): void
    {
        $tutorialPeriod->update([
            'status' => TutorialPeriodStatus::ASSIGNING->value,
        ]);
    }

    public function revertToDraft(TutorialPeriod $tutorialPeriod): void
    {
        $tutorialPeriod->update([
            'status' => TutorialPeriodStatus::DRAFT->value,
        ]);
    }

    public function cancel(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException('This tutorial period cannot be cancelled');
    }

    public function getPermissions(TutorialPeriod $tutorialPeriod): array
    {
        return [
            'canEdit' => true,
            'canDelete' => false,
            'canOpen' => false,
            'canAssigning' => true,
            'canOngoing' => false,
            'canClose' => false,
            'canCancel' => false,
            'canRevertToDraft' => true,
            'canReopenRegistration' => false,
            'canRestore' => false,
        ];
    }

    public function getEditableFields(): array
    {
        return [
            'title',
            'description',
            'registration_start_at',
            'registration_end_at',
        ];
    }
}
