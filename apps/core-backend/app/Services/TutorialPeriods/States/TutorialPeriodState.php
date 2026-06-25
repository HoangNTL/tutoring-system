<?php

namespace App\Services\TutorialPeriods\States;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

abstract class TutorialPeriodState
{
    abstract public function status(): TutorialPeriodStatus;

    public static function make(TutorialPeriodStatus|string $status): self
    {
        $statusValue = $status instanceof TutorialPeriodStatus ? $status : TutorialPeriodStatus::from($status);

        return match ($statusValue) {
            TutorialPeriodStatus::DRAFT => new DraftState(),
            TutorialPeriodStatus::OPEN => new OpenState(),
            TutorialPeriodStatus::ASSIGNING => new AssigningState(),
            TutorialPeriodStatus::ONGOING => new OngoingState(),
            TutorialPeriodStatus::CLOSED => new ClosedState(),
            TutorialPeriodStatus::CANCELLED => new CancelledState(),
        };
    }

    public function open(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException("Only tutorial periods in DRAFT status can be opened");
    }

    public function assigning(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException("Only tutorial periods in OPEN status can be moved to ASSIGNING");
    }

    public function ongoing(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException("Only tutorial periods in ASSIGNING status can be moved to ONGOING");
    }

    public function close(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException("Only tutorial periods in ONGOING status can be closed");
    }

    public function revertToDraft(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException("Only tutorial periods in OPEN status can be reverted to DRAFT");
    }

    public function reopenRegistration(TutorialPeriod $tutorialPeriod): void
    {
        throw new ConflictHttpException("Only tutorial periods in ASSIGNING status can be reopened for registration");
    }

    public function restore(TutorialPeriod $tutorialPeriod, TutorialPeriodStatus $targetStatus): void
    {
        throw new ConflictHttpException("Only cancelled tutorial periods can be restored");
    }

    public function cancel(TutorialPeriod $tutorialPeriod): void
    {
        $tutorialPeriod->update([
            'status' => TutorialPeriodStatus::CANCELLED->value,
        ]);
    }

    /**
     * @return array<string, bool>
     */
    public function getPermissions(TutorialPeriod $tutorialPeriod): array
    {
        return [
            'canEdit' => false,
            'canDelete' => false,
            'canOpen' => false,
            'canAssigning' => false,
            'canOngoing' => false,
            'canClose' => false,
            'canCancel' => true, // Default for cancellable states (Draft, Assigning, Ongoing)
            'canRevertToDraft' => false,
            'canReopenRegistration' => false,
            'canRestore' => false,
        ];
    }

    /**
     * @return array<int, string>
     */
    public function getEditableFields(): array
    {
        return [];
    }
}
