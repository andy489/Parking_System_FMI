<?php
/**
 * Define DB
 */
class DB {
    // the endpoint to this class
    private $connection;

    function __construct() {
        // get the db credentials from the .ini file and create an associative array
        $db = parse_ini_file("db_info.ini");

        // get the info defined in the .ini file to make the connection to the database
        $host = $db["host"];
        $dbname = $db["dbname"];
        $password = $db["password"];
        $user = $db["user"];
        $type = $db["type"];
        $dsn = "$type:host=$host;dbname=$dbname";

        // create the connection
        try {
            $this->connection = new PDO($dsn, $user, $password, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
        } catch (PDOException $e) {
            throw new PDOException($e->getMessage());
        }
    }

    function getConnection() {
        return $this->connection;
    }
}

?>