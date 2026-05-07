<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TestService
{
    public function getTest($param = [])
    {
        $response = Http::legacy()->get('/test-db', $param);

        if ($response->failed()) {
            Log::error("Express API Error: " . $response->status());
            return [];
        }

        return $response->json();
    }
}
