/* when the user clicks on the "Изход" option, log him out by:
   1. send a GET request to the backend, signalling that it should destroy the user's session
   2. redirect the user to the log in page
*/

(function() {
    const logOutOption = document.getElementById("log-out");

    logOutOption.addEventListener("click", () => {
        logOut()
        .then((response) => {
            if (response["status"] === "SUCCESS") {
                window.location.replace("../login/login_form.html");
            }
            else {
                throw new Error(response["message"]);
            }
        })
        .catch((error) => {
            console.log(error);
        })
    })
})()

function logOut() {
    return fetch("../../backend/api/logout_user/delete_user_session.php")
    .then((response) => {return response.json()})
    .then((data) => {return data})
}