<?php
namespace Config;

class Env
{
    private static array $vars = [];

    public static function load(string $path = null): void
    {
        $path = $path ?? dirname(__DIR__, 2) . '/.env';
        if (!file_exists($path)) return;
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (str_starts_with(trim($line), '#')) continue;
            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                self::$vars[$key] = $value;
                putenv("{$key}={$value}");
            }
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        if (isset(self::$vars[$key])) return self::$vars[$key];
        $value = getenv($key);
        return $value !== false ? $value : $default;
    }

    public static function required(string $key): string
    {
        $value = self::get($key);
        if ($value === null || $value === '') {
            throw new \RuntimeException("Required env var '{$key}' not set.");
        }
        return $value;
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $value = self::get($key);
        return $value !== null ? filter_var($value, FILTER_VALIDATE_BOOLEAN) : $default;
    }

    public static function int(string $key, int $default = 0): int
    {
        $value = self::get($key);
        return $value !== null ? (int) $value : $default;
    }
}
