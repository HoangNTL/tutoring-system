<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use App\States\TutorialPeriods\TutorialPeriodStateFactory;

class TutorialPeriodPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::ADMIN;
    }

    public function view(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN;
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::ADMIN;
    }

    public function update(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->state($tutorialPeriod)->canEdit();
    }

    public function delete(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->state($tutorialPeriod)->canDelete();
    }

    public function open(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->state($tutorialPeriod)->canOpen();
    }

    public function cancel(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->state($tutorialPeriod)->canCancel();
    }

    public function assigning(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->state($tutorialPeriod)->canAssigning();
    }

    public function ongoing(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->state($tutorialPeriod)->canOngoing();
    }

    public function close(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->state($tutorialPeriod)->canClose();
    }

    private function state(TutorialPeriod $tutorialPeriod)
    {
        return app(TutorialPeriodStateFactory::class)->forTutorialPeriod($tutorialPeriod);
    }
}
