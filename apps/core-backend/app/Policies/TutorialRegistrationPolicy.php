<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class TutorialRegistrationPolicy
{
    public function register(User $user): bool
    {
        return $user->role === UserRole::STUDENT;
    }

    public function cancel(User $user): bool
    {
        return $user->role === UserRole::STUDENT;
    }

    public function viewInfo(User $user): bool
    {
        return $user->role === UserRole::STUDENT;
    }
}
