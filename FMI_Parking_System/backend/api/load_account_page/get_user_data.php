<?php 

require_once("../../db/db_connection/connect_to_db.php");
require_once("../functions/login.php");

/* returns the firstname, lastname, email and the user type so that this info can be displayed on the user's main page */

session_start();
// if there is no session set but there are cookies set
if (!isset($_SESSION["user"]) && isset($_COOKIE["email"]) && isset($_COOKIE["password"])) {
    $user = ["email" => $_COOKIE["email"], "password" => $_COOKIE["password"]]; // create an associative array which contains the user email and password, saved on the cookies (we shall use this array to create a session)
    $response = login($user); // create the session for the user

    if ($response["status"] == "ERROR") { // if there was an error creating the session
        http_response_code($response["code"]);
        exit(json_encode(["status" => $response["status"], "message" => $response["message"]]));
    }
}
// if there is no session and at least one cookie is missing return an error
else if (!isset($_SESSION["user"]) && (!isset($_COOKIE["email"]) || !isset($_COOKIE["password"]))) {
    http_response_code(401);
    exit(json_encode(["status" => "UNAUTHENTICATED", "message" => "Потребителят не е автентикиран!"]));
}

$user_id = $_SESSION["user"]["id"];

try {
    $db = new DB();
    $connection = $db->getConnection();

    $sql = "SELECT firstname,lastname,email,user_type 
            FROM users 
            WHERE id = :id";

    $stmt = $connection->prepare($sql);
    $stmt->execute(["id" => $user_id]);

    $user_data = $stmt->fetch(PDO::FETCH_ASSOC); // only one row will be returned from the database since we filter our search by id which is unique
    
    http_response_code(200);
    exit(json_encode(["status" => "SUCCESS", "data" => $user_data]));
}
catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
}

?>