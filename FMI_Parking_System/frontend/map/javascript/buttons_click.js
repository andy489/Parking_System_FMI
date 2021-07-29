/* define how the buttons for the slots react when they are pressed by the user */

(function() {
    const buttons = document.getElementsByTagName("button"); // get all the buttons for the slots

    // for each button add a separate event listener
    for (let button of buttons) {
        button.addEventListener('click', () => {
            if (!button.classList.contains("non-taken-slot")) { // if the button does not correspond to a non-taken (free) slot, then do nothing
                return;
            }

            // in the confirmation box add the button which was just pressed
            const selectedButton = document.getElementById("selected-button");
            selectedButton.textContent = button.textContent;

            // wait until the user has either pressed "Да" or "Не"
            waitForUserInput().then((response) => {
                document.getElementById("confirm-message-container").classList.add("non-visible"); // hide the confirmation box when the user has clicked one of the two options
                document.querySelector("div.dimmer").classList.add("non-visible"); // hide the dimmer, so that it does not dim the page

                if (response == false) { // if the user has pressed "Не", then he is not sure in his decision, so do nothing
                    return;
                }

                // if "Да" was pressed, then reserve that slot
                sendReservationData(button);
            })
        });
    }
})();

function sendReservationData(button) {
    const selectedDate = document.getElementById("date-value"); // get the searched date
        
    if (selectedDate == null) { // if the section with the searched time interval doesn't exist yet
        return;
    }

    const selectedStart = document.getElementById("start-time-value"); // get the start time of the searched interval
    const selectedEnd = document.getElementById("end-time-value"); // get the end time of the searched interval

    /*

    Create the object reservationInfo which will contain the information about the pressed button and the searched interval
    It will look like:

    reservationInfo = {
        button: ...
        date: ...
        start-time: ...
        end-time: ...
    }

    */

    let reservationInfo = {};
    reservationInfo["button"] = button.textContent;
    reservationInfo["date"] = selectedDate.textContent;
    reservationInfo["start-time"] = selectedStart.textContent;
    reservationInfo["end-time"] = selectedEnd.textContent;

    // make the reservation of the slot for the given interval
    makeReservation(reservationInfo)
    .then((response) => {
        displayResponse(response["status"], response["message"]);
        if (response["status"] == "SUCCESS") { // if the slot was reserved successfully, color the button in yellow
            button.classList.remove("non-taken-slot");
            button.classList.add("user-taken-slot");
        }
        else if (response["status"] == "TAKEN") { // if the slot was already taken, then color the button in red - no reservation was made
            button.classList.remove("non-taken-slot");
            button.classList.add("taken-slot");
        }
        else {
            throw new Error(response["message"]);
        }
    })
    .catch((error) => {
        console.log(error); // log the error for now
    })
}

// reserve the slot which the user has pressed for the given interval
function makeReservation(reservationInfo) {
    return fetch("../../backend/api/reserve_slots/reserve_slot.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationInfo)
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    })
}

function displayResponse(responseStatus, responseMessage) {
    const responseDiv = document.getElementById("reservation-response");

    // remove the pop-up classes in case the user has pressed another button while the message was still being displayed
    removePopupClasses(responseDiv);

    if (responseStatus == "SUCCESS" ) {
        responseDiv.classList.add("success");
    }
    else {
        responseDiv.classList.add("error");
    }
    responseDiv.textContent = responseMessage;

    // add animation
    responseDiv.classList.add("show-popup");

    // wait for show-popup's animation
    waitForAnimation(responseDiv)
    .then(() => {
        // remove the classes we just added to the response div to prepare it for the next time it is used again
        removePopupClasses(responseDiv);
    })
}

function waitForAnimation(div) {
    return div.getAnimations()[0].finished; // return a Promise which will resolve once the animation is finished
}

function removePopupClasses(responseDiv) {
    responseDiv.classList.remove("show-popup");
    responseDiv.classList.remove("error");
    responseDiv.classList.remove("success");
}

function waitForUserInput() {
    return new Promise((resolve, reject) => {
        let isUserSure = false;
        document.getElementById("confirm-message-container").classList.remove("non-visible"); // display the confirmation box
        document.querySelector("div.dimmer").classList.remove("non-visible"); // dim the background

        const confirmButton = document.getElementById("yes-button"); // get the "Да" button
        const denyButton = document.getElementById("no-button"); // get the "Не" button

        // invoke only once
        confirmButton.addEventListener('click', () => {
            isUserSure = true; // user is sure
            resolve(isUserSure);
        }, {once: true});
        
        // invoke only once
        denyButton.addEventListener('click', () => {
            resolve(isUserSure);
        }, {once: true});
    })
}