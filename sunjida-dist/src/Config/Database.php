<?php
namespace Config;

class Database
{
    private static ?\PDO $instance = null;

    public static function getInstance(): \PDO
    {
        if (self::$instance === null) {
            $host = Env::get('DB_HOST', 'localhost');
            $port = Env::get('DB_PORT', '3306');
            $database = Env::get('DB_DATABASE', 'salesdaddy');
            $username = Env::get('DB_USER', 'root');
            $password = Env::get('DB_PASS', '');
            $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
            self::$instance = new \PDO($dsn, $username, $password, [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                \PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        }
        return self::$instance;
    }

    public static function reset(): void { self::$instance = null; }
}
