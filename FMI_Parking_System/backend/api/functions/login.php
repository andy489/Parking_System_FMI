<?php 

require_once("../../db/db_connection/connect_to_db.php");

/* a function used to log in the user, create his session and set the according cookies
   also a function that is used whenever the user has cookies and no session - creates the session for him */

function login($user) {
    try {
        $db = new DB();
        $connection = $db->getConnection();
        
        $select = "SELECT id, user_type, password 
                    FROM users 
                    WHERE email = :email";
    
        $stmt = $connection->prepare($select);
        $stmt->execute(["email" => $user["email"]]);
    
        // no such user exists
        if ($stmt->rowCount() == 0) {
            return ["status" => "ERROR", "message" => "Не съществува потребител с посочения имейл!", "code" => 400];
        }
    
        $db_user = $stmt->fetch(PDO::FETCH_ASSOC); // we expect only one row since we are filtering our query by email which is unique
    
        // check if passwords match
        if (!password_verify($user["password"], $db_user["password"])) {
            return ["status" => "ERROR", "message" => "Невалидна парола!", "code" => 400];
        }
    } 
    catch (PDOException $e) {
        return ["status" => "ERROR", "message" => "Неочаквана грешка настъпи в сървъра!", "code" => 500];
    }

    // if the user input correct data, start the user's session
    session_start();
    $_SESSION["user"] = $db_user;
    
    // set cookies
    setcookie("email", $user["email"], time() + 600, "/");
    setcookie("password", $user["password"], time() + 600, "/");

    return ["status" => "SUCCESS", "message" => "Успешно влизане в системата!", "code" => 200];
}

?>