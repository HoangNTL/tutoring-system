<?php

namespace App\Policies;

use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;

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
            && $tutorialPeriod->status === TutorialPeriodStatus::DRAFT;
    }

    public function delete(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $tutorialPeriod->status === TutorialPeriodStatus::DRAFT;
    }

    public function open(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $tutorialPeriod->status === TutorialPeriodStatus::DRAFT;
    }

    public function cancel(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && !in_array(
                $tutorialPeriod->status,
                [TutorialPeriodStatus::CLOSED, TutorialPeriodStatus::CANCELLED],
                true
            );
    }

    public function assigning(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $tutorialPeriod->status === TutorialPeriodStatus::OPEN;
    }

    public function ongoing(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $tutorialPeriod->status === TutorialPeriodStatus::ASSIGNING;
    }

    public function close(User $user, TutorialPeriod $tutorialPeriod): bool
    {
        return $user->role === UserRole::ADMIN
            && $tutorialPeriod->status === TutorialPeriodStatus::ONGOING;
    }
}
