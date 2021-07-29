<?php

require_once("../../db/db_connection/connect_to_db.php");
require_once("../functions/login.php");

/* return the user's schedule for the current day */

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
    exit(json_encode(["status" => "ERROR", "message" => "Потребителят не е автентикиран!"]));
}

$user_id = $_SESSION["user"]["id"];

try {
    $db = new DB();
    $connection = $db->getConnection();

    $sql = "SELECT discipline_name, discipline_type, date, start_time, end_time, faculty 
            FROM schedules s JOIN user_schedules us ON us.schedule_id = s.id 
            WHERE us.user_id = :user_id AND date = CURDATE()";

    $stmt = $connection->prepare($sql);
    $stmt->execute(["user_id" => $user_id]);

    // if the user doesn't have any schedules in the database, return success with no data
    if ($stmt->rowCount() == 0) {
        http_response_code(200);
        exit(json_encode(["status" => "SUCCESS", "data" => ""]));
    }

    $schedules = null;
    $rowNum = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) { // fetch each returned row from the database
        $date = date_create($row["start_time"]); // we need the DateTimeObject for the date_format() call
        $row["start_time"] = date_format($date, 'H:i'); // convert db date format hh:mm:ss to hh:mm

        // same as above but for the end time of the interval
        $date = date_create($row["end_time"]);
        $row["end_time"] = date_format($date, 'H:i');

        $schedules[$rowNum] = $row;
        $rowNum+=1;
    }

    http_response_code(200);
    exit(json_encode(["status" => "SUCCESS", "data" => $schedules]));

}
catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
}

?>