<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

interface TutorialPeriodState
{
    public function status(): TutorialPeriodStatus;

    public function canEdit(): bool;

    public function canDelete(): bool;

    public function canOpen(): bool;

    public function canAssigning(): bool;

    public function canOngoing(): bool;

    public function canClose(): bool;

    public function canCancel(): bool;

    public function allowsTransitionTo(TutorialPeriodStatus $status): bool;

    /**
     * @return array<string, bool>
     */
    public function permissions(): array;
}
