<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpFoundation\Cookie;
use Tests\TestCase;

class SanctumLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_csrf_cookie_endpoint_issues_xsrf_and_session_cookies(): void
    {
        $this->withMiddleware();

        $response = $this->get('/sanctum/csrf-cookie');

        $response->assertNoContent();
        $this->assertNotSame('', $this->cookieValue($response->headers->getCookies(), 'XSRF-TOKEN'));
        $this->assertNotSame('', $this->cookieValue($response->headers->getCookies(), config('session.cookie')));
    }

    public function test_login_and_me_follow_the_sanctum_spa_flow(): void
    {
        $this->withMiddleware();

        User::create([
            'username' => 'admin',
            'password_hash' => 'password123',
            'role' => UserRole::ADMIN,
        ]);

        $csrf = $this->issueSanctumCookies();

        $loginResponse = $this
            ->withCookie('XSRF-TOKEN', $csrf['xsrf'])
            ->withCookie(config('session.cookie'), $csrf['session'])
            ->withHeader('X-XSRF-TOKEN', $csrf['xsrf'])
            ->postJson('/api/v1/auth/login', [
                'username' => 'admin',
                'password' => 'password123',
            ]);

        $loginResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.username', 'admin');

        $sessionCookie = $this->cookieValue(
            $loginResponse->headers->getCookies(),
            config('session.cookie')
        );

        $this
            ->withCookie(config('session.cookie'), $sessionCookie)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.user.username', 'admin');
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    /**
     * @return array{xsrf: string, session: string}
     */
    private function issueSanctumCookies(): array
    {
        $response = $this->get('/sanctum/csrf-cookie');
        $cookies = $response->headers->getCookies();

        return [
            'xsrf' => urldecode($this->cookieValue($cookies, 'XSRF-TOKEN')),
            'session' => $this->cookieValue($cookies, config('session.cookie')),
        ];
    }

    /**
     * @param  array<int, Cookie>  $cookies
     */
    private function cookieValue(array $cookies, string $name): string
    {
        foreach ($cookies as $cookie) {
            if ($cookie->getName() === $name) {
                return $cookie->getValue();
            }
        }

        $this->fail("Missing cookie [{$name}] in response.");
    }
}
