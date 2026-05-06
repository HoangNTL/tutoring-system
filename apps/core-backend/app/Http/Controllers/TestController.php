<?php

namespace App\Http\Controllers;

use App\Services\TestService;

class TestController extends Controller
{
    protected $testService;

    public function __construct(TestService $testService)
    {
        $this->testService = $testService;
    }

    public function index()
    {
        return $this->testService->getTest();
    }
}
