<?php 

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

$email = $user_data["email"]; // get input email
$password = $user_data["password"]; // get input password
$user = ["email" => $email, "password" => $password];

// login user
$response = login($user);

http_response_code($response["code"]);
exit(json_encode(["status" => $response["status"], "message" => $response["message"]]));

?>