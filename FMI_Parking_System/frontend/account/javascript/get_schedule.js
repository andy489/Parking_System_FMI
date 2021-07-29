(function() {

    const uploadButton = document.getElementById("first-button"); // get the "Качване на график" button of tab "Моят график"
    const scheduleButton = document.getElementById("second-button"); // get the "График" button of tab "Моят график"
    const slotsButton = document.getElementById("third-button"); // get the "Запазени паркоместа" button of tab "Моят график"

    const uploadSection = document.getElementById("upload-file-section"); // get the section which will be displayed when button "Качване на график" is pressed
    const scheduleSection = document.getElementById("schedule-section"); // get the section which will be displayed when button "График" is pressed
    const slotsSection = document.getElementById("slots-section"); // get the section which will be displayed when button "Запазени паркоместа" is pressed

    let isStudent = false; // determine whether the user is a student; if he is - then block the access to the first two buttons of the "Моят график" tab
    checkUserType()
    .then((response) => {
        if (response["user_type"] == "Студент") {
            isStudent = true;
        }
    })
    .then(() => {
        if (isStudent == false) { // if user is not a student
            getScheduleData()
            .then((schedules) => {
                if (schedules["status"] == "SUCCESS") {
                    const allSchedules = schedules["data"]; // get the upcoming schedule of the user
                    const container = document.getElementById("upcoming-schedule"); // get the container where the schedule will reside
                    container.innerHTML = null; // clear from previous search
        
                    for (let schedule of allSchedules) {
                        createSchedule(schedule, container); // attach each schedule to the container
                    }
                }
                else {
                    throw new Error(schedule["message"]);
                }
            })      
            .catch((error) => {
                console.log(error); // for now, log the error; could add response pop-up
            })
        }
        else { // if user is a student
            uploadButton.classList.add("inactive"); // set "Качване на график" button to be inactive
            scheduleButton.classList.add("inactive"); // set "График" button to be inactive
            scheduleButton.classList.remove("active"); // remove default active button which is "График" button
            slotsButton.classList.add("active"); // make the active button - "Запазени паркоместа" button

            slotsSection.classList.remove("no-display"); // display the "Запазени паркоместа" section
            scheduleSection.classList.add("no-display"); // hide the "График" section

            // query the backend which slots has the student reserved
            getTakenSlots()
            .then((takenSlots) => {
                if (takenSlots["status"] == "SUCCESS") {
                    const slots = takenSlots["data"]; // get the student's taken slots
                    const container = document.getElementById("taken-slots"); // get the div element where the taken slots will be attached
                    container.innerHTML = null; // clear the container from previous click
    
                    for (let slot of slots) {
                        createSlotSchedule(slot, container); // attach each taken slot to the container
                    }
                }
                else {
                    throw new Error(schedule["message"]);
                }
            })
            .catch((error) => {
                console.log(error); // log the error for now
            })
        }
        
        addEventListeners(isStudent); // add event listneres to the buttons which are not inactive
    })

    function addEventListeners(isStudent) {
        if (!isStudent) { // if user is not a student add event listeners for all buttons ("Качване на график", "График", "Запазени паркоместа")
            /* all events that are going to be listened to are click events on the given button */
            uploadButton.addEventListener("click", () => { // if "Качване на график" button is pressed, make that button active and display the respective section
                uploadSection.classList.remove("no-display");
                scheduleSection.classList.add("no-display");
                slotsSection.classList.add("no-display");
        
                uploadButton.classList.add("active");
                scheduleButton.classList.remove("active");
                slotsButton.classList.remove("active");
            });

            scheduleButton.addEventListener("click", () => { // if "График" button is pressed, make that button active, display the respective section and load the section content from a query to the backend
                uploadSection.classList.add("no-display");
                scheduleSection.classList.remove("no-display");
                slotsSection.classList.add("no-display");
        
                uploadButton.classList.remove("active");
                scheduleButton.classList.add("active");
                slotsButton.classList.remove("active");
        
                // get the upcoming schedule of the user by querying the backend
                getScheduleData()
                .then((schedules) => {
                    if (schedules["status"] == "SUCCESS") {
                        const allSchedules = schedules["data"]; // get the returned schedules of the user
                        const container = document.getElementById("upcoming-schedule"); // get the div element where each schedule will be attacheds
                        container.innerHTML = null; // clear the container from the previous button click
            
                        for (let schedule of allSchedules) {
                            createSchedule(schedule, container); // attach each schedule to the div element (the container)
                        }
                    }
                    else {
                        throw new Error(schedule["message"]);
                    }
                })      
                .catch((error) => {
                    console.log(error); // log the error for now
                })
            });
        }

        // if user is student execute only the below lines of code
    
        slotsButton.addEventListener("click", () => { // if "Запазени паркоместа" button is pressed, then make that button active, display the respective section and load the section content from q query to the backend
            uploadSection.classList.add("no-display");
            scheduleSection.classList.add("no-display");
            slotsSection.classList.remove("no-display");
    
            uploadButton.classList.remove("active");
            scheduleButton.classList.remove("active");
            slotsButton.classList.add("active");
    
            // get the taken slots from the user by querying the backend
            getTakenSlots()
            .then((takenSlots) => {
                if (takenSlots["status"] == "SUCCESS") {
                    const slots = takenSlots["data"]; // get the returned reserved slots
                    const container = document.getElementById("taken-slots"); // get the div element where the slots will reside
                    container.innerHTML = null; // clear the div's content from previous button clicks
    
                    for (let slot of slots) {
                        createSlotSchedule(slot, container); // attach each reserved slot to the container (the div element)
                    }
                }
                else {
                    throw new Error(schedule["message"]);
                }
            })
            .catch((error) => {
                console.log(error); // log the error for now
            })
        });
    }

    /* create a rectangular box containing the given schedule information and attach it to the container div
       here we use two spans as wrappers in order to use the css flexbox to center the texts vertically and horizontally*/
    function createSchedule(schedule, container) {
        const div = document.createElement("div"); // create the rectangular box
        div.classList.add("schedule");
        div.classList.add("schedule-item");
    
        const firstSpanWrapper = document.createElement("span"); // first span contains the header (the type of the schedule)
        const h4 = document.createElement("h4");
        h4.textContent = schedule["discipline_type"] + ": " + schedule["discipline_name"]; // for example: "Лекция: WEB"
        firstSpanWrapper.appendChild(h4);
    
        const secondSpanWrapper = document.createElement("span"); // second span contains a paragraph (the info of the schedule)
        const p = document.createElement("p");
        p.textContent = schedule["date"] + ", " + schedule["start_time"] + "—" + schedule["end_time"] + ", " + schedule["faculty"]; // for example: "2021-06-24, 15:00-17:00, ФЗФ"
        secondSpanWrapper.appendChild(p);
        
        // append both spans to the div element (the rectangular box)
        div.appendChild(firstSpanWrapper);
        div.appendChild(secondSpanWrapper);
    
        // append the rectangular box (which contains information about the given schedule) to the container element
        container.appendChild(div);
    }

    /* create a rectangular box containing the given reserved slot information and attach it to the container div
       here we use two spans as wrappers in order to use the css flexbox to center the texts vertically and horizontally */
    function createSlotSchedule(slot, container) {
        const div = document.createElement("div"); // create the rectangular box
        div.classList.add("schedule");
        div.classList.add("schedule-item");
    
        const firstSpanWrapper = document.createElement("span"); // first span contains the header (which slot is taken)
        const h4 = document.createElement("h4");
        h4.textContent = "Паркомясто: " + slot["zone"] + slot["code"]; // for example: "Паркомясто: B7"
        firstSpanWrapper.appendChild(h4);
    
        const secondSpanWrapper = document.createElement("span"); // second span contains information about the taken slot (when and for what interval)
        const p = document.createElement("p");
        p.textContent = slot["date"] + ", " + slot["start_time"] + "—" + slot["end_time"]; // for example: "2021-06-24, 15:00-17:00"
        secondSpanWrapper.appendChild(p);
        
        // append both spans to the div element (the rectangular box)
        div.appendChild(firstSpanWrapper);
        div.appendChild(secondSpanWrapper);
    
        // append the rectangular box (which contains information about the given reserved slot) to the container element
        container.appendChild(div);
    }
})()

// send a GET request to the backend in order to recieve the upcoming schedule of the user
function getScheduleData() {
    return fetch("../../backend/api/load_user_schedule_data/load_user_schedule.php")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    })
}

// send a GET request to the backend in order to recieve the reserved slots for the upcoming days by the user
function getTakenSlots() {
    return fetch("../../backend/api/load_user_schedule_data/load_user_taken_slots.php")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    })
}

// send a GET request to the backend in order to check whether the user is a student or not
function checkUserType() {
    return fetch("../../backend/api/check_user_type/check_user_type.php")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    })
}