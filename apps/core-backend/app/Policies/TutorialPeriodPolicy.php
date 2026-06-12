<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use App\Services\TutorialPeriods\TutorialPeriodStatusService;

class TutorialPeriodPolicy
{
    public function __construct(
        private TutorialPeriodStatusService $statusService
    ) {}
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
            && $this->statusService->canEdit($tutorialPeriod);
    }

    public function delete(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->statusService->canDelete($tutorialPeriod);
    }

    public function open(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->statusService->canOpen($tutorialPeriod);
    }

    public function cancel(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->statusService->canCancel($tutorialPeriod);
    }

    public function assigning(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->statusService->canAssigning($tutorialPeriod);
    }

    public function ongoing(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->statusService->canOngoing($tutorialPeriod);
    }

    public function close(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $this->statusService->canClose($tutorialPeriod);
    }
}
