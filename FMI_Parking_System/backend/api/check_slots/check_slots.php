<?php

require_once("../../db/db_connection/connect_to_db.php");
require_once("../functions/check_JSON_validity.php");
require_once("../functions/login.php");

// php://input is a readonly stream which allows us to read raw data from the request body - it returnes all the raw data after the HTTP headers of the request no matter the content type
// file_get_contents() reads file into a string, but in this case it parses the raw data from the stream into the string
$data = file_get_contents("php://input");
$user_data; // this will be used for the decoded data (JSON decoded)

// check if the input JSON is correct
if (strlen($data) > 0 && check_json($data)) {
    $user_data = json_decode($data, true);
}
else {
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Невалиден JSON формат!"]));
}

session_start(); // we need to use $_SESSION variable
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

$user_type = $_SESSION["user"]["user_type"]; // get the user's type

$date = $user_data["date"]; // get the provided date

if (strlen($date) == 0) { // check whether any date was provided
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Не е въведена дата!"]));
}

$date = date("Y-m-d", strtotime($date)); // converts the date from input to YYYY-MM-DD

// check if the interval is correct (that one case)
if ($user_data["start-time"] >= $user_data["end-time"]) {
    http_response_code(400);
    exit(json_encode(["status" => "ERROR", "message" => "Невалиден времеви интервал!"]));
}

$start_time = $user_data["start-time"];

$format = 'H'; // defines the format from the input
$formatted_date = DateTime::createFromFormat($format, $start_time); // creates Date Time object from the input start time which is needed for date_format()
$formatted_start_time = date_format($formatted_date,"H:i:s"); // converts the input start time to HH:MM:SS

$end_time = $user_data["end-time"];

$formatted_date = DateTime::createFromFormat($format, $end_time);
$formatted_end_time = date_format($formatted_date,"H:i:s");

// establish a connection to the database
try {
    $db = new DB();
    $connection = $db->getConnection();
}
catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Неуспешна връзка към базата данни!"]));
}

// check if user has lecture or exercise in the specified date and time interval
if ($user_type != "Студент") {
    try {
        $sql = "SELECT date, start_time, end_time
                FROM schedules s JOIN user_schedules us ON us.schedule_id = s.id 
                WHERE us.user_id = :user_id AND s.date = :date";
    
        $stmt = $connection->prepare($sql);
        $stmt->execute(["user_id" => $_SESSION["user"]["id"], "date" => $date]);
    
        $isStudent = false;
    
        if ($stmt->rowCount() == 0) { // if there were no returned rows, then his type will be set to student
            $user_type = "Студент";
            $isStudent = true;
        }
        else {
            $hours = array_fill(7, 16, false); // create an associative array from 7 to 16
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $corrected_start_time = substr($row["start_time"], 0, strpos($row["start_time"], ":")); // get the first part of the returned time, for example => returned: 18:00:00 => corrected: 18
    
                if ($corrected_start_time[0] == "0") { // if corrected_start_time has a leading zero (07, 08, 09), remove it
                    $corrected_start_time = substr($corrected_start_time, 1, strlen($corrected_start_time));
                }
    
                $corrected_end_time = substr($row["end_time"], 0, strpos($row["end_time"], ":")); // get the first part of the returned time, for example => returned: 16:00:00, corrected => 16
    
                if ($corrected_end_time[0] == "0") { // if corrected_end_time has a leading zero (08, 09), remove it
                    $corrected_end_time = substr($corrected_end_time, 1, strlen($corrected_end_time));
                }
    
                for ($start = $corrected_start_time - 1; $start < $corrected_end_time + 1; $start++) { // padding
                    $hours[$start] = true; // hours[10] == true means he can park from 10 to 11
                }
            }
        }
    }
    catch (PDOException $e) {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }
    
    // if the user has lecture or exercise in the specified date and time interval, check whether the input time interval coincides fully with at least one schedule interval
    if (!$isStudent) {
        for ($start = $start_time; $start < $end_time; $start++) {
            if ($hours[$start] == false) {
                $user_type = "Студент"; // make the user student in case the condition described above is broken
                break;
            }
        }
    }
}

try {
    $sql = "SELECT s.code, s.zone, s.lecturer_only
    FROM reservations r JOIN slots s ON r.slot_id = s.id
    WHERE r.date LIKE :date AND
    (
    (r.start_time < :start_time AND r.end_time > :start_time) OR
    (r.start_time >= :start_time AND r.end_time <= :end_time) OR
    (r.start_time < :end_time AND r.end_time > :end_time) OR
    (r.start_time < :start_time AND r.end_time > :end_time)
    );";

    $stmt = $connection->prepare($sql);
    $stmt->execute(["date" => $date, "start_time" => $formatted_start_time, "end_time" => $formatted_end_time]);

    $slots_taken = array(); // creates an empty array
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if ($user_type == "Хоноруван преподавател" && $row["zone"] == "A" && $row["lecturer_only"] == 1) { // if the user is a "Хоноруван преподавател", then zone A's 0-6 slots are unavailable to him
            continue;
        }
        else if ($user_type == "Студент" && $row["lecturer_only"] == 1) { // if the user's a student then he doesn't has access to every zone's 0-6 slots except D's
            continue;
        }

        array_push($slots_taken, $row); // array of associative arrays
    }
} catch(PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
}

$unavailable_slots = array(); // creates an empty array

if ($user_type == "Хоноруван преподавател") { // if the user is "Хоноруван преподавател" his unavailable slots are only A0-A6
    try {
        $sql = "SELECT code, zone
                FROM slots
                WHERE zone LIKE 'A' AND lecturer_only = TRUE;";

        $stmt = $connection->prepare($sql);
        $stmt->execute();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($unavailable_slots, $row); // push every unavaliable slot in the array
        }
    }
    catch (PDOException $e) {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }
}
else if ($user_type == "Студент") { // if the user is "Студент" his unavailable slots are A0-A6, B0-B6, C0-C6
    try {
        $sql = "SELECT code, zone
                FROM slots
                WHERE lecturer_only = TRUE;";

        $stmt = $connection->prepare($sql);
        $stmt->execute();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($unavailable_slots, $row); // push every unavaliable slot in the array
        }
    }
    catch (PDOException $e) {
        http_response_code(500);
        exit(json_encode(["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!"]));
    }
}

http_response_code(200);
exit(json_encode(["status" => "SUCCESS", "taken_slots" => $slots_taken, "unavailable_slots" => $unavailable_slots]));

?>