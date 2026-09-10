<?php
/**
 * JWT Unit Tests
 */

declare(strict_types=1);

namespace Sunjida\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Sunjida\Utils\JWT;

class JWTTest extends TestCase
{
    private static bool $initialized = false;

    protected function setUp(): void
    {
        if (!self::$initialized) {
            // Set a test secret
            $_ENV['JWT_SECRET'] = 'test-secret-key-for-unit-tests';
            $_ENV['JWT_EXPIRY'] = '3600';
            self::$initialized = true;
        }
    }

    public function testCreateReturnsToken(): void
    {
        $token = JWT::create(['user_id' => 1, 'email' => 'test@example.com']);

        $this->assertNotEmpty($token);
        $this->assertStringContainsString('.', $token);

        $parts = explode('.', $token);
        $this->assertCount(3, $parts);
    }

    public function testVerifyValidToken(): void
    {
        $payload = ['user_id' => 1, 'email' => 'test@example.com'];
        $token = JWT::create($payload);

        $decoded = JWT::verify($token);

        $this->assertNotNull($decoded);
        $this->assertEquals(1, $decoded['user_id']);
        $this->assertEquals('test@example.com', $decoded['email']);
        $this->assertArrayHasKey('iat', $decoded);
        $this->assertArrayHasKey('exp', $decoded);
    }

    public function testVerifyInvalidToken(): void
    {
        $decoded = JWT::verify('invalid.token.here');
        $this->assertNull($decoded);
    }

    public function testVerifyTamperedToken(): void
    {
        $token = JWT::create(['user_id' => 1]);

        // Tamper with the payload
        $parts = explode('.', $token);
        $parts[1] = base64_encode(json_encode(['user_id' => 2]));
        $tamperedToken = implode('.', $parts);

        $decoded = JWT::verify($tamperedToken);
        $this->assertNull($decoded);
    }

    public function testTokenContainsIatAndExp(): void
    {
        $token = JWT::create(['user_id' => 1]);
        $decoded = JWT::verify($token);

        $this->assertArrayHasKey('iat', $decoded);
        $this->assertArrayHasKey('exp', $decoded);
        $this->assertGreaterThan(0, $decoded['iat']);
        $this->assertGreaterThan($decoded['iat'], $decoded['exp']);
    }

    public function testExtractFromHeaderReturnsNull(): void
    {
        $_SERVER['HTTP_AUTHORIZATION'] = '';
        $token = JWT::extractFromHeader();
        $this->assertNull($token);
    }

    public function testExtractFromHeaderReturnsToken(): void
    {
        $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer abc.def.ghi';
        $token = JWT::extractFromHeader();
        $this->assertEquals('abc.def.ghi', $token);
    }

    public function testExtractFromHeaderCaseInsensitive(): void
    {
        $_SERVER['HTTP_AUTHORIZATION'] = 'bearer abc.def.ghi';
        $token = JWT::extractFromHeader();
        $this->assertEquals('abc.def.ghi', $token);
    }

    public function testCreatePreservesCustomClaims(): void
    {
        $token = JWT::create([
            'user_id' => 1,
            'role' => 'admin',
            'custom' => 'value',
        ]);

        $decoded = JWT::verify($token);

        $this->assertEquals(1, $decoded['user_id']);
        $this->assertEquals('admin', $decoded['role']);
        $this->assertEquals('value', $decoded['custom']);
    }
}
