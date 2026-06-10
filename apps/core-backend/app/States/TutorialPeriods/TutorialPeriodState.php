<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

interface TutorialPeriodState
{
    public function status(): TutorialPeriodStatus;

    public function canEdit(): bool;

    public function canDelete(): bool;

    /**
     * @return list<string>
     */
    public function editableFields(): array;

    /**
     * @return list<TutorialPeriodStatus>
     */
    public function allowedStatuses(): array;
}
