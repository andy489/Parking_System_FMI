(function() {
    const form = document.getElementById("registration-form"); // the registration form
    const inputs = document.querySelectorAll("input, select"); // the input fields and the select one
    const responseDiv = document.getElementById("response-message"); // the div that will contain the error message if the backend returned an error

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // prevent the form from resetting

        // remove styles from last error message
        responseDiv.classList.remove("error");

        // remove last error message
        responseDiv.innerHTML = null;

        // gather all the input information
        let data = {};
        inputs.forEach(input => {
            data[input.name] = input.value;
        })

        sendFormData(data)
        .then((responseMessage) => {
            if (responseMessage["status"] === "ERROR") {
                throw new Error(responseMessage["message"]);
            }
            else {
                window.location.replace("../account/account_view.html"); // redirect user to his newly created account
            }
        })
        .catch((errorMsg) => {
            showDiv(responseDiv, errorMsg); // create an error message if the server returned an error
        })
    })
})();

/* send the inputted data over to the backend and based on the server's response, display an error message or redirect user to his newly created account */
function sendFormData(data) {
    return fetch("../../backend/api/registration/register_user.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    })
}

function showDiv(div, message) {
    // create the image of the error (a white exclamation mark)
    let statusImage = document.createElement("img");

    // attach image attributes src and alt
    statusImage.src = "./images/error_response.png";
    statusImage.alt = "white exclamation mark on red background";

    // toggle classes
    div.classList.add("error");
    div.classList.remove("no-display");

    // create error text and append to span element
    let messageContainer = document.createElement("span");
    let responseMessage = document.createElement("p");
    responseMessage.textContent = message;
    messageContainer.appendChild(responseMessage);

    // append all created elements to the response div
    div.appendChild(statusImage);
    div.appendChild(messageContainer);
}