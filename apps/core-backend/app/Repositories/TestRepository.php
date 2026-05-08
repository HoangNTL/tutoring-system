<?php

namespace App\Repositories;

use App\Models\User;
use App\Traits\PaginationHelper;

class TestRepository
{
    use PaginationHelper;

    public function getAllUsers(array $params)
    {
        $query = User::query();

        // search
        if (!empty($param['search'])) {
            $query->where('name', 'like', '%' . $params['search'] . '%');
        }

        // sort
        $sortBy = $params['sortBy'] ?? 'created_at';
        $sortOrder = $params['sortOrder'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // pagination
        $paginated = $query->paginate($params['limit'] ?? 10);

        return $this->formatPaginator($paginated);
    }

    public function saveUser($data)
    {
        return User::create($data);
    }
}
