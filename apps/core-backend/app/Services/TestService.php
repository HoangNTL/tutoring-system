<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TestService
{
    public function getTest()
    {
        $response = Http::legacy()->get('/test-db');

        if ($response->failed()) {
            Log::error("Express API Error: " . $response->status());
            return [];
        }

        return $response->json();
    }
}
