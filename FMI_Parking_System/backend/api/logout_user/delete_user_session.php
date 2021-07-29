<?php 

session_start();

$_SESSION = array(); // clear it

/* delete the cookies */
if (isset($_COOKIE["email"])) {
    unset($_COOKIE["email"]);
    setcookie("email", null, time() - 3600, "/");
}

if (isset($_COOKIE["password"])) {
    unset($_COOKIE["password"]);
    setcookie("password", null, time() - 3600, "/");
}

/* destroy the user's session when he leaves */
if (session_destroy()) {
    http_response_code(200);
    exit(json_encode(["status" => "SUCCESS", "message" => "Успешно излизане!"]));
}
else {
    http_response_code(500);
    exit(json_encode(["status" => "ERROR", "message" => "Неочакван проблем се появи при излизането!"]));
}

?>