<?php

namespace App\Http\Controllers;

use App\Http\Requests\BaseQueryParamsRequest;
use App\Services\TestService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    protected TestService $testService;

    public function __construct(TestService $testService)
    {
        $this->testService = $testService;
    }

    public function index(BaseQueryParamsRequest $request)
    {
        $params = $request->validated();

        $res = $this->testService->getTest($params);

        return $this->success($res['items'], 'Data fetched successfully', $res['meta']);

        // call service to get data from database directly
        // $params = $request->validated();

        // $data = $this->testService->getTest($params);

        // return $this->success($data['items'], 'Data fetched successfully', $data['meta']);
    }
}
