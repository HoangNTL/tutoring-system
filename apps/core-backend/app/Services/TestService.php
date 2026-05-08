<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Repositories\TestRepository;

class TestService
{
    protected TestRepository $testRepository;

    public function __construct(TestRepository $testRepository)
    {
        $this->testRepository = $testRepository;
    }

    public function getTest(array $params)
    {
        // Call legacy Express API
        $response = Http::legacy()->get('/test-db', $params);

        if ($response->failed()) {
            Log::error("Express API Error: " . $response->status());
            return ['items' => [], 'meta' => null];
        }

        $resData = $response->json();

        return [
            'items' => $resData['data'] ?? [],
            'meta' =>  $resData['meta'] ?? null,
        ];

        // call database directly
        // return $this->testRepository->getAllUsers($params);
    }
}
