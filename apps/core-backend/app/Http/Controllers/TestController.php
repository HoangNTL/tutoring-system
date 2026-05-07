<?php

namespace App\Http\Controllers;

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

    public function index(Request $request)
    {
        $apiResponse = $this->testService->getTest([
            'page' => $request->query('page', 1),
            'limit' => $request->query('limit', 10),
        ]);

        if (!$apiResponse || !$apiResponse['success']) {
            return back()->with('error', 'Failed to fetch data from Express API');
        }

        $items = $apiResponse['data'];
        $meta  = $apiResponse['meta'];

        Log::info("check data: " . json_encode($items));
        Log::info("check meta: " . json_encode($meta));

        $paginatedData = new LengthAwarePaginator(
            $items,
            $meta['total'],
            $meta['perPage'],
            $meta['currentPage'],
            // [
            //     'path'  => $request->url(),
            //     'query' => $request->query(),
            // ]
        );

        return $paginatedData;
    }
}
