<?php

require_once("../../db/db_connection/connect_to_db.php");
require_once("../functions/login.php");

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

// check if there exists an inputted file
if (!isset($_FILES["csv"]["name"])) {
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Не е предоставен csv файл!"]));
}

$file_name = $_FILES["csv"]["name"]; // get the inputted csv file

$file_contents = null;
try {
    $file_contents = file_get_contents($_FILES["csv"]["tmp_name"]); // parse the file contents
}
catch (Exception $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Грешка настъпи при отваряне на файл."]));
}

$rows = explode("\n", $file_contents); // divide the file contents by newline delimiter, creating an array of rows
$schedules = [];

for ($i = 0; $i < count($rows); $i++) {
    // ltrim - remove white spaces at the start of the string
    // rtrim - remove white spaces at the end of the string
    $row = explode(",", rtrim($rows[$i])); // divide each row by ',' delimiter; we get an array of the data which is easier to access

    // if the csv file has a header or has an empty row, skip
    if ($row[0] == "Дисциплина" || $row[0] == "") {
        continue;
    }

    $newDate = date("Y-m-d", strtotime(ltrim($row[2]))); // convert DD-MM-YYYY to YYYY-MM-DD
    $schedule = ["discipline_name" => ltrim($row[0]), "discipline_type" => ltrim($row[1]), "date" => $newDate, "start_time" => ltrim($row[3]), "end_time" => ltrim($row[4]), "faculty" => ltrim($row[5])];

    array_push($schedules, $schedule);
}

try {
    $db = new DB();
    $connection = $db->getConnection();

    $sql = "INSERT INTO schedules (discipline_name, discipline_type, date, start_time, end_time, faculty)
                        VALUES (:discipline_name, :discipline_type, :date, :start_time, :end_time, :faculty)";

    $stmt = $connection->prepare($sql);
    for ($i = 0; $i < count($schedules); $i++) {
        $stmt->execute($schedules[$i]); // execute the above sql statement for each schedule in the array schedules
    }

    // now we want to connect each newly added schedule to the user that has inputted the csv file
    // for that, we will need the user id and the ids of the newly added schedules
    $lastId = $connection->lastInsertId(); // returns the last inserted row's id
    $user_id = $_SESSION["user"]["id"];

    $sql = "INSERT INTO user_schedules (user_id, schedule_id) 
                                VALUES (:user_id, :schedule_id)";

    $stmt = $connection->prepare($sql);
    $start_id = $lastId - count($schedules) + 1; // get the id of the first schedule we just added

    // for each schedule's id execute the above sql statement
    while ($start_id != $lastId + 1) {
        $stmt->execute(["user_id" => $user_id, "schedule_id" => $start_id]);
        $start_id += 1;
    }
} 
catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
}

http_response_code(200);
exit(json_encode(["status" => "SUCCESS", "message" => "Успешно добавен график!"]));

?>