/* when the site is loaded, get the user data from the backend and attach it on the page */

(function() {
    getUserData()
    .then((userData) => {
        if (userData["status"] === "SUCCESS") {
            renderUserData(userData["data"]);
        }
        else if (userData["status"] == "UNAUTHENTICATED") { // if there is no session or cookies, return the user to the login page
            window.location.replace("../login/login_form.html");
        }
        else {
            throw new Error(userData["message"]);
        }
    })
    .catch((error) => {
        console.log(error); // log the error for now
    })
})()

// send a GET request to the backend in order to recieve the user's data
function getUserData() {
    return fetch("../../backend/api/load_account_page/get_user_data.php")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    })
}

function renderUserData(data) {
    const firstnamePar = document.getElementById("firstname");
    const lastnamePar = document.getElementById("lastname");
    const emailPar = document.getElementById("email");
    const typePar = document.getElementById("user-type");

    firstnamePar.innerHTML = firstnamePar.innerHTML.concat(data["firstname"]);
    lastnamePar.innerHTML = lastnamePar.innerHTML.concat(data["lastname"]);
    emailPar.innerHTML = emailPar.innerHTML.concat(data["email"]);
    typePar.innerHTML = typePar.innerHTML.concat(data["user_type"]);
}