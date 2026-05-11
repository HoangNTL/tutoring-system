<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        $remember = $request->boolean('remember');

        if (!Auth::attempt([
            'username' => $credentials['username'],
            'password' => $credentials['password'],
        ], $remember)) {

            return $this->error('Invalid credentials', 401);
        }

        $request->session()->regenerate();

        return $this->success([
            'user' => $request->user(),
        ], 'Login successful', null, 200);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return $this->success(null, 'Logout successful', null, 200);
    }
}
