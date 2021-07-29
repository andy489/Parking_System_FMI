/* when the user submits the form for the searched interval, send q query to the backend to recieve the non-taken, taken and unavailable slots */

(function() {

    const searchBtn = document.querySelector("img.search-btn"); // get the "Търси" button
    searchBtn.addEventListener('click', () => { // whenever the "Търси" button is pressed
        const data = document.querySelectorAll("input#date, select#start-time, select#end-time"); // get the date input and the selects for the start and end time of the searched interval
        
        /* create an object which will look like:
        
        serch_data = {
            date: ...;
            start-time: ...;
            end-time: ...;
        }
        
        */
        let search_data = {};
        data.forEach((field) => {
            search_data[field.name] = field.value;
        })

        // clear the form first
        // remove all attached attributes to the options of the select for the end time of the interval
        const endSelectOptions = document.querySelectorAll("select#end-time option");
        const form = document.getElementById("search-form");

        endSelectOptions.forEach((option) => {
            option.removeAttribute("hidden");
            option.removeAttribute("selected");
            option.removeAttribute("disabled");
        });

        // reset the form
        form.reset();

        sendSearchData(search_data)
        .then((data) => { // recieves buttons to be colored in red
            if (data["status"] == "SUCCESS") {
                colorButtons(data["taken_slots"], data["unavailable_slots"]);
                createSearchParams(search_data["date"], search_data["start-time"], search_data["end-time"])
            }
            else {
                throw new Error(data["message"]);
            }
        })
        .catch((errorMsg) => {
            displayError(errorMsg);
        })
    })
})();

// send a POST request over to the backend in order to send the searched interval and recieve the information about the buttons
function sendSearchData(data) {
    return fetch("../../backend/api/check_slots/check_slots.php", {
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

/* color buttons accordingly:

   green: non-taken slot
   red: taken slot
   gray: unavailable slot

*/
function colorButtons(takenSlots, unavailableSlots) {
    const buttons = document.getElementsByTagName("button");

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("taken-slot"); // remove class from previous searches
        buttons[i].classList.remove("non-taken-slot"); // remove class from previous searches
        buttons[i].classList.remove("unavailable-slot"); // remove class from previous searches
        buttons[i].classList.remove("user-taken-slot"); // remove class from previous searches
    }

    for (let i = 0; i < takenSlots.length; i++) { // go through all the returned taken buttons
        let zoneSlot = takenSlots[i]["zone"] + takenSlots[i]["code"]; // for example: "A7"

        for (let j = 0; j < buttons.length; j++) {
            if (buttons[j].textContent == zoneSlot) { // find the button from above in all the buttons
                buttons[j].classList.add("taken-slot");
                buttons[j].classList.remove("non-taken-slot"); // remove from previous searches
            }
        }
    }

    // color the rest in green, meaning that they are non-taken
    for (let i = 0; i < buttons.length; i++) {
        if (!buttons[i].classList.contains("taken-slot")) {
            buttons[i].classList.add("non-taken-slot");
        }
    }

    // color the unavailable slots in gray
    for (let i = 0; i < unavailableSlots.length; i++) {
        let zoneSlot = unavailableSlots[i]["zone"] + unavailableSlots[i]["code"]; // for example: "A7"

        for (let j = 0; j < buttons.length; j++) {
            if (buttons[j].textContent == zoneSlot) { // find the button from above in all the buttons
                buttons[j].classList.add("unavailable-slot");
                buttons[j].classList.remove("non-taken-slot"); // remove from previous searches
                buttons[j].classList.remove("taken-slot"); // remove from previous searches
            }
        }
    }
}

function displayError(message) {
    // display a message for the user saying whether his file was successfully registered or not
    const responseDiv = document.getElementById("response");
    responseDiv.classList.add("error");
    responseDiv.innerHTML = message;

    // add animation
    responseDiv.classList.add("show-popup");

    // wait for show-popup's animation
    waitForAnimation(responseDiv)
    .then(() => {
        // remove the classes we just added to the response div to prepare it for the next time it is used again
        responseDiv.classList.remove("show-popup");
        responseDiv.classList.remove("error");
    })
}

// create a Promise - waits for the show-popup's animation to finish
function waitForAnimation(div) {
    return div.getAnimations()[0].finished;
}

// create a rectangular box which will contain the information of the last searched interval
function createSearchParams(date, startTime, endTime) {
    const formInputs = document.getElementById("form-inputs");

    if (formInputs.lastElementChild.id == "search-params") {
        formInputs.removeChild(formInputs.lastElementChild); // remove the last searched interval box because we will add a new one now
    }

    const div = document.createElement("div"); // the box itself
    div.id = "search-params";
    
    const h2 = document.createElement("h2");
    h2.classList.add("text");
    h2.textContent = "Избран времеви интервал";
    div.appendChild(h2);

    const p = document.createElement("p");

    const dateSpan = document.createElement("span");
    dateSpan.id = "date-value";
    dateSpan.textContent = date;

    const startSpan = document.createElement("span");
    startSpan.id = "start-time-value";
    startSpan.textContent = startTime;

    const endSpan = document.createElement("span");
    endSpan.id = "end-time-value";
    endSpan.textContent = endTime;

    const text1 = document.createTextNode("Дата: ");
    const text2 = document.createTextNode("; Интервал: ");
    const text3 = document.createTextNode("—");
    
    p.appendChild(text1);
    p.appendChild(dateSpan);
    p.appendChild(text2);
    p.appendChild(startSpan);
    p.appendChild(text3);
    p.appendChild(endSpan);

    div.appendChild(p);

    formInputs.appendChild(div);
}