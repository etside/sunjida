<?php
/**
 * Validator Utility
 * Input validation for API requests
 */

declare(strict_types=1);

namespace Sunjida\Utils;

class Validator
{
    private array $errors = [];

    public function required(string $field, $value): self
    {
        if ($value === null || $value === '' || $value === []) {
            $this->errors[$field] = "{$field} is required";
        }
        return $this;
    }

    public function email(string $field, ?string $value): self
    {
        if ($value !== null && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = "{$field} must be a valid email address";
        }
        return $this;
    }

    public function minLength(string $field, ?string $value, int $min): self
    {
        if ($value !== null && strlen($value) < $min) {
            $this->errors[$field] = "{$field} must be at least {$min} characters";
        }
        return $this;
    }

    public function maxLength(string $field, ?string $value, int $max): self
    {
        if ($value !== null && strlen($value) > $max) {
            $this->errors[$field] = "{$field} must not exceed {$max} characters";
        }
        return $this;
    }

    public function numeric(string $field, $value): self
    {
        if ($value !== null && !is_numeric($value)) {
            $this->errors[$field] = "{$field} must be numeric";
        }
        return $this;
    }

    public function integer(string $field, $value): self
    {
        if ($value !== null && !ctype_digit((string) $value)) {
            $this->errors[$field] = "{$field} must be an integer";
        }
        return $this;
    }

    public function in(string $field, $value, array $allowed): self
    {
        if ($value !== null && !in_array($value, $allowed, true)) {
            $this->errors[$field] = "{$field} must be one of: " . implode(', ', $allowed);
        }
        return $this;
    }

    public function url(string $field, ?string $value): self
    {
        if ($value !== null && !filter_var($value, FILTER_VALIDATE_URL)) {
            $this->errors[$field] = "{$field} must be a valid URL";
        }
        return $this;
    }

    public function array(string $field, $value): self
    {
        if ($value !== null && !is_array($value)) {
            $this->errors[$field] = "{$field} must be an array";
        }
        return $this;
    }

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function firstError(): ?string
    {
        return !empty($this->errors) ? reset($this->errors) : null;
    }

    public function reset(): self
    {
        $this->errors = [];
        return $this;
    }
}
