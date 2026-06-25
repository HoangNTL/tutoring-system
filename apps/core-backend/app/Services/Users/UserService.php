<?php

namespace App\Services\Users;

use App\Enums\UserRole;
use App\Models\User;
use App\Traits\PaginationHelper;
use App\Repositories\UserRepository;
use Illuminate\Database\Eloquent\Builder;

class UserService
{
    use PaginationHelper;

    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function getAll(array $filters): array
    {
        $paginator = $this->userRepository->searchAndPaginate($filters);

        return $this->formatPaginator($paginator);
    }

    public function updatePassword(int $userId, string $password): void
    {
        $user = User::findOrFail($userId);
        $user->update([
            'password_hash' => $password,
        ]);
    }
}
