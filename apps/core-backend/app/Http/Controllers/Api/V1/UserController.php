<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ListUsersRequest;
use App\Http\Requests\User\UpdateUserPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Users\UserService;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index(ListUsersRequest $request)
    {
        $this->authorize('viewAny', User::class);

        $result = $this->userService->getAll($request->validated());

        return $this->success(
            UserResource::collection(collect($result['items'])),
            'Users retrieved successfully',
            $result['meta']
        );
    }

    public function updatePassword(UpdateUserPasswordRequest $request, User $user)
    {
        $this->authorize('updatePassword', $user);

        $this->userService->updatePassword($user->id, $request->validated()['password']);

        return $this->success(null, 'User password updated successfully');
    }
}
