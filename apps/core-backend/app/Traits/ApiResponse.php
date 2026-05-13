<?php

namespace App\Traits;

trait ApiResponse
{
    protected function success($data, $message = 'Success', $meta = null, $code = 200)
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ];

        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    protected function error($message = 'Error', $code = 500, $errors = null)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $code);
    }
}
