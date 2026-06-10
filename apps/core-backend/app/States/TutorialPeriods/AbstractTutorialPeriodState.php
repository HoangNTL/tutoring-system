<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

abstract class AbstractTutorialPeriodState implements TutorialPeriodState
{
    public function canEdit(): bool
    {
        return false;
    }

    public function canDelete(): bool
    {
        return false;
    }

    public function canOpen(): bool
    {
        return false;
    }

    public function canAssigning(): bool
    {
        return false;
    }

    public function canOngoing(): bool
    {
        return false;
    }

    public function canClose(): bool
    {
        return false;
    }

    public function canCancel(): bool
    {
        return false;
    }

    public function allowsTransitionTo(TutorialPeriodStatus $status): bool
    {
        return false;
    }

    public function permissions(): array
    {
        return [
            'canEdit' => $this->canEdit(),
            'canDelete' => $this->canDelete(),
            'canOpen' => $this->canOpen(),
            'canAssigning' => $this->canAssigning(),
            'canOngoing' => $this->canOngoing(),
            'canClose' => $this->canClose(),
            'canCancel' => $this->canCancel(),
        ];
    }
}
