<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::ADMIN;
    }

    public function view(User $user, User $targetUser): bool
    {
        return $user->role === UserRole::ADMIN;
    }

    public function updatePassword(User $user, User $targetUser): bool
    {
        return $user->role === UserRole::ADMIN
            && in_array($targetUser->role, [UserRole::LECTURER, UserRole::STUDENT, UserRole::DEPARTMENT], true);
    }
}
