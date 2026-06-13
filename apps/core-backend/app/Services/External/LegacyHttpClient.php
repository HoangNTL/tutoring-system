<?php

namespace App\Services\External;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class LegacyHttpClient
{
    private const TIMEOUT_SECONDS = 5;

    private const RETRY_TIMES = 3;

    private const RETRY_DELAY_MS = 200;

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getCollection(string $endpoint): array
    {
        try {
            $response = Http::legacy()
                ->timeout(self::TIMEOUT_SECONDS)
                ->retry(self::RETRY_TIMES, self::RETRY_DELAY_MS)
                ->get($endpoint)
                ->throw();

            return $this->extractCollectionPayload($response->json());
        } catch (RequestException $exception) {
            if ($exception->response?->status() === 404) {
                return [];
            }

            $this->logRequestFailure($endpoint, $exception);

            throw new RuntimeException(
                "Failed to fetch data from legacy service",
                0,
                $exception,
            );
        } catch (\Throwable $exception) {
            $this->logTransportFailure($endpoint, $exception);

            throw new RuntimeException(
                "Legacy service is unavailable",
                0,
                $exception,
            );
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    public function getOptionalResource(string $endpoint): ?array
    {
        try {
            $response = Http::legacy()
                ->timeout(self::TIMEOUT_SECONDS)
                ->retry(self::RETRY_TIMES, self::RETRY_DELAY_MS, throw: false)
                ->get($endpoint);

            if ($response->status() === 404) {
                return null;
            }

            if ($response->failed()) {
                throw new RequestException($response);
            }

            $payload = $response->json();

            return is_array($payload["data"] ?? null) ? $payload["data"] : null;
        } catch (RequestException $exception) {
            $this->logRequestFailure($endpoint, $exception);

            throw new RuntimeException(
                "Failed to fetch data from legacy service",
                0,
                $exception,
            );
        } catch (\Throwable $exception) {
            $this->logTransportFailure($endpoint, $exception);

            throw new RuntimeException(
                "Legacy service is unavailable",
                0,
                $exception,
            );
        }
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array{lastPage: int}}
     */
    public function getPage(string $endpoint, int $page, int $limit): array
    {
        try {
            $response = Http::legacy()
                ->timeout(self::TIMEOUT_SECONDS)
                ->retry(self::RETRY_TIMES, self::RETRY_DELAY_MS)
                ->get($endpoint, [
                    "page" => $page,
                    "limit" => $limit,
                ])
                ->throw();

            $payload = $response->json();

            return [
                "data" => $this->extractCollectionPayload($payload),
                "meta" => [
                    "lastPage" => max(
                        (int) ($payload["meta"]["lastPage"] ?? 1),
                        1,
                    ),
                ],
            ];
        } catch (RequestException $exception) {
            Log::error("Legacy API request failed", [
                "endpoint" => $endpoint,
                "page" => $page,
                "limit" => $limit,
                "status" => $exception->response?->status(),
                "error" => $exception->getMessage(),
            ]);

            throw new RuntimeException(
                "Failed to fetch data from legacy service",
                0,
                $exception,
            );
        } catch (\Throwable $exception) {
            Log::error("Legacy API transport failure", [
                "endpoint" => $endpoint,
                "page" => $page,
                "limit" => $limit,
                "error" => $exception->getMessage(),
            ]);

            throw new RuntimeException(
                "Legacy service is unavailable",
                0,
                $exception,
            );
        }
    }

    /**
     * @param  mixed  $payload
     * @return array<int, array<string, mixed>>
     */
    private function extractCollectionPayload(mixed $payload): array
    {
        if (!is_array($payload)) {
            return [];
        }

        return is_array($payload["data"] ?? null) ? $payload["data"] : [];
    }

    private function logRequestFailure(
        string $endpoint,
        RequestException $exception,
    ): void {
        Log::error("Legacy API request failed", [
            "endpoint" => $endpoint,
            "status" => $exception->response?->status(),
            "error" => $exception->getMessage(),
        ]);
    }

    private function logTransportFailure(
        string $endpoint,
        \Throwable $exception,
    ): void {
        Log::error("Legacy API transport failure", [
            "endpoint" => $endpoint,
            "error" => $exception->getMessage(),
        ]);
    }
}
