<?php
/**
 * Retry Utility
 * Handles retry logic with exponential backoff
 */

declare(strict_types=1);

namespace Sunjida\Utils;

class Retry
{
    /**
     * Execute a callback with retry logic
     *
     * @param callable $callback Function to execute
     * @param int $maxAttempts Maximum number of attempts
     * @param int $baseDelay Base delay in milliseconds
     * @param callable|null $onFailure Called on each failure before retry
     * @return mixed Result of the callback
     * @throws \RuntimeException If all attempts fail
     */
    public static function run(
        callable $callback,
        int $maxAttempts = 3,
        int $baseDelay = 1000,
        ?callable $onFailure = null
    ): mixed {
        $lastException = null;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return $callback($attempt);
            } catch (\Exception $e) {
                $lastException = $e;

                if ($onFailure) {
                    $onFailure($e, $attempt);
                }

                if ($attempt < $maxAttempts) {
                    $delay = self::calculateDelay($attempt, $baseDelay);
                    usleep($delay * 1000);
                }
            }
        }

        throw new \RuntimeException(
            "Failed after {$maxAttempts} attempts: " . ($lastException?->getMessage() ?? 'Unknown error'),
            0,
            $lastException
        );
    }

    /**
     * Execute a callback with retry for specific exception types
     *
     * @param callable $callback Function to execute
     * @param string[] $retryableExceptions Exception classes that trigger retry
     * @param int $maxAttempts Maximum number of attempts
     * @param int $baseDelay Base delay in milliseconds
     * @return mixed Result of the callback
     * @throws \RuntimeException If all attempts fail
     */
    public static function runForExceptions(
        callable $callback,
        array $retryableExceptions,
        int $maxAttempts = 3,
        int $baseDelay = 1000
    ): mixed {
        return self::run(
            function (int $attempt) use ($callback) {
                return $callback($attempt);
            },
            $maxAttempts,
            $baseDelay,
            function (\Exception $e) use ($retryableExceptions): void {
                $isRetryable = false;
                foreach ($retryableExceptions as $exceptionClass) {
                    if ($e instanceof $exceptionClass) {
                        $isRetryable = true;
                        break;
                    }
                }

                if (!$isRetryable) {
                    throw $e;
                }
            }
        );
    }

    /**
     * Calculate delay with exponential backoff and jitter
     */
    private static function calculateDelay(int $attempt, int $baseDelay): int
    {
        // Exponential backoff: baseDelay * 2^(attempt-1)
        $delay = $baseDelay * (1 << ($attempt - 1));

        // Add jitter: 0-25% of the delay
        $jitter = (int) ($delay * 0.25 * (mt_rand(0, 100) / 100));

        return $delay + $jitter;
    }
}
