<?php
/**
 * Logger Utility
 * Simple PSR-3 style logger with file and structured output
 */

declare(strict_types=1);

namespace Sunjida\Utils;

class Logger
{
    private string $logDir;
    private string $level;

    private const LEVELS = [
        'debug' => 0,
        'info' => 1,
        'warning' => 2,
        'error' => 3,
        'critical' => 4,
    ];

    public function __construct(string $logDir = null, string $level = 'info')
    {
        $this->logDir = $logDir ?? dirname(__DIR__, 2) . '/logs';
        $this->level = $level;

        if (!is_dir($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
    }

    public function debug(string $message, array $context = []): void
    {
        $this->log('debug', $message, $context);
    }

    public function info(string $message, array $context = []): void
    {
        $this->log('info', $message, $context);
    }

    public function warning(string $message, array $context = []): void
    {
        $this->log('warning', $message, $context);
    }

    public function error(string $message, array $context = []): void
    {
        $this->log('error', $message, $context);
    }

    public function critical(string $message, array $context = []): void
    {
        $this->log('critical', $message, $context);
    }

    private function log(string $level, string $message, array $context): void
    {
        if (self::LEVELS[$level] < self::LEVELS[$this->level]) {
            return;
        }

        $entry = [
            'timestamp' => date('c'),
            'level' => $level,
            'message' => $message,
            'context' => $context,
        ];

        if (!empty($context)) {
            $entry['context'] = $context;
        }

        $line = json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n";
        $filename = $this->logDir . '/' . date('Y-m-d') . '.log';

        file_put_contents($filename, $line, FILE_APPEND | LOCK_EX);
    }
}
