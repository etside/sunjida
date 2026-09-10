<?php
/**
 * Security Unit Tests
 */

declare(strict_types=1);

namespace Sunjida\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Sunjida\Utils\Security;

class SecurityTest extends TestCase
{
    public function testSanitizeHtml(): void
    {
        $input = '<script>alert("xss")</script>';
        $result = Security::sanitize($input);

        $this->assertStringNotContainsString('<script>', $result);
        $this->assertStringContainsString('&lt;script&gt;', $result);
    }

    public function testSanitizeQuotes(): void
    {
        $input = 'He said "hello" and she said \'hi\'';
        $result = Security::sanitize($input);

        $this->assertStringContainsString('&quot;', $result);
        $this->assertStringContainsString('&#039;', $result);
    }

    public function testSanitizeTrimsWhitespace(): void
    {
        $input = '  hello world  ';
        $result = Security::sanitize($input);

        $this->assertEquals('hello world', $result);
    }

    public function testRandomStringLength(): void
    {
        $result = Security::randomString(32);
        $this->assertEquals(32, strlen($result));
    }

    public function testRandomStringIsHex(): void
    {
        $result = Security::randomString(16);
        $this->assertMatchesRegularExpression('/^[0-9a-f]+$/', $result);
    }

    public function testRandomStringIsUnique(): void
    {
        $a = Security::randomString(32);
        $b = Security::randomString(32);

        $this->assertNotEquals($a, $b);
    }

    public function testHashPassword(): void
    {
        $password = 'mysecretpassword';
        $hash = Security::hashPassword($password);

        $this->assertNotEquals($password, $hash);
        $this->assertStringStartsWith('$2y$', $hash);
    }

    public function testVerifyPassword(): void
    {
        $password = 'mysecretpassword';
        $hash = Security::hashPassword($password);

        $this->assertTrue(Security::verifyPassword($password, $hash));
    }

    public function testVerifyPasswordFails(): void
    {
        $hash = Security::hashPassword('correctpassword');

        $this->assertFalse(Security::verifyPassword('wrongpassword', $hash));
    }

    public function testGetClientIpReturnsValidIp(): void
    {
        $_SERVER['REMOTE_ADDR'] = '192.168.1.1';
        $ip = Security::getClientIp();

        $this->assertNotEmpty($ip);
        $this->assertNotEquals('0.0.0.0', $ip);
    }

    public function testRateLimitAllowsRequests(): void
    {
        $key = 'test_rate_limit_' . uniqid();

        // Should allow first few requests
        $this->assertTrue(Security::checkRateLimit($key, 5, 60));
        $this->assertTrue(Security::checkRateLimit($key, 5, 60));
    }

    public function testRateLimitBlocksExcessRequests(): void
    {
        $key = 'test_rate_limit_block_' . uniqid();

        // Exhaust the limit
        for ($i = 0; $i < 3; $i++) {
            Security::checkRateLimit($key, 3, 60);
        }

        // Next request should be blocked
        $this->assertFalse(Security::checkRateLimit($key, 3, 60));
    }
}
