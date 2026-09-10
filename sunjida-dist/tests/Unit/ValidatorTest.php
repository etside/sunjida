<?php
/**
 * Validator Unit Tests
 */

declare(strict_types=1);

namespace Sunjida\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Sunjida\Utils\Validator;

class ValidatorTest extends TestCase
{
    private Validator $validator;

    protected function setUp(): void
    {
        $this->validator = new Validator();
    }

    public function testRequiredFieldPasses(): void
    {
        $this->validator->required('name', 'John');
        $this->assertFalse($this->validator->fails());
    }

    public function testRequiredFieldFails(): void
    {
        $this->validator->required('name', '');
        $this->assertTrue($this->validator->fails());
        $this->assertArrayHasKey('name', $this->validator->errors());
    }

    public function testRequiredFieldFailsOnNull(): void
    {
        $this->validator->required('name', null);
        $this->assertTrue($this->validator->fails());
    }

    public function testEmailValidationPasses(): void
    {
        $this->validator->email('email', 'test@example.com');
        $this->assertFalse($this->validator->fails());
    }

    public function testEmailValidationFails(): void
    {
        $this->validator->email('email', 'invalid-email');
        $this->assertTrue($this->validator->fails());
    }

    public function testMinLengthPasses(): void
    {
        $this->validator->minLength('password', '123456', 6);
        $this->assertFalse($this->validator->fails());
    }

    public function testMinLengthFails(): void
    {
        $this->validator->minLength('password', '123', 6);
        $this->assertTrue($this->validator->fails());
    }

    public function testMaxLengthPasses(): void
    {
        $this->validator->maxLength('name', 'John', 50);
        $this->assertFalse($this->validator->fails());
    }

    public function testMaxLengthFails(): void
    {
        $this->validator->maxLength('name', str_repeat('a', 101), 100);
        $this->assertTrue($this->validator->fails());
    }

    public function testNumericValidationPasses(): void
    {
        $this->validator->numeric('price', '29.99');
        $this->assertFalse($this->validator->fails());
    }

    public function testNumericValidationFails(): void
    {
        $this->validator->numeric('price', 'abc');
        $this->assertTrue($this->validator->fails());
    }

    public function testInValidationPasses(): void
    {
        $this->validator->in('status', 'active', ['active', 'inactive', 'pending']);
        $this->assertFalse($this->validator->fails());
    }

    public function testInValidationFails(): void
    {
        $this->validator->in('status', 'deleted', ['active', 'inactive', 'pending']);
        $this->assertTrue($this->validator->fails());
    }

    public function testMultipleValidations(): void
    {
        $this->validator
            ->required('email', 'test@example.com')
            ->email('email', 'test@example.com')
            ->required('password', 'secret123')
            ->minLength('password', 'secret123', 6);

        $this->assertFalse($this->validator->fails());
        $this->assertEmpty($this->validator->errors());
    }

    public function testMultipleValidationFailures(): void
    {
        $this->validator
            ->required('email', '')
            ->email('email', 'invalid')
            ->required('password', '');

        $this->assertTrue($this->validator->fails());
        $this->assertCount(3, $this->validator->errors());
    }

    public function testResetClearsErrors(): void
    {
        $this->validator->required('field', '');
        $this->assertTrue($this->validator->fails());

        $this->validator->reset();
        $this->assertFalse($this->validator->fails());
    }

    public function testFirstErrorReturnsFirstMessage(): void
    {
        $this->validator
            ->required('name', '')
            ->email('email', 'invalid');

        $error = $this->validator->firstError();
        $this->assertNotNull($error);
        $this->assertStringContainsString('name', $error);
    }
}
