<?php

namespace App\Traits;

use Illuminate\Http\Resources\Json\JsonResource;

trait ApiResponse
{
    protected function success($data, $message = 'Success', $meta = null, $code = 200)
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $this->normalizeResponseData($data),
        ];

        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    protected function error($message = 'Error', $code = 500, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message,
            'data' => null,
            'meta' => null,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    protected function normalizeResponseData(mixed $data): mixed
    {
        if ($data instanceof JsonResource) {
            return $data->resolve(request());
        }

        if (!is_array($data)) {
            return $data;
        }

        foreach ($data as $key => $value) {
            $data[$key] = $this->normalizeResponseData($value);
        }

        return $data;
    }
}
