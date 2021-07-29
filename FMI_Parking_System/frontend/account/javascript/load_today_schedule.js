/* when the site is loaded, load the schedule for the current day for the respective lecturer */

(function() {
    getTodaySchedule()
    .then((schedule) => {
        if (schedule["status"] == "ERROR") {
            throw new Error(schedule["message"]);
        }

        createSchedule(schedule["data"]); // load the box containing the schedule for today
    })
    .catch((error) => {
        console.log(error); // log the error for now
    })

    function createSchedule(data) {
        const scheduleDiv = document.querySelector("#account-details div.schedule"); // get the div where we will put the recieved schedules
        scheduleDiv.innerHTML = null; // clear its contents in case the schedule is updated
    
        // get current day
        let currentDate = new Date();
        let currentDay = getDayInText(currentDate.getDay()); // getDayInText() returnes the name of the current day in Bulgarian
    
        // create the header - contains the day of the week
        let h4 = document.createElement("h4");
        h4.textContent = currentDay;
        scheduleDiv.appendChild(h4);
    
        if (data == null) {
            return;
        }
    
        // get the unique names of the courses that are returned from the backend
        let courses = getUniqueDisciplines(data);
    
        // for each unique course name
        for (let i = 0; i < courses.length; i++) {
            // create the name of the course
            let coursePar = document.createElement("p");
            coursePar.textContent = courses[i];
    
            let ul = document.createElement("ul");
    
            // create a li element for each schedule which has a course name the current course name (courses[i])
            data.forEach((row) => {
                if (row["discipline_name"] === courses[i]) {
                    let li = document.createElement("li");
                    li.innerHTML += "<strong>" + row["discipline_type"] + ":</strong>" + " " + row["start_time"] + " - " + row["end_time"] + " (" + row["faculty"] + ")"; // for example: "Лекция: 09:00 - 11:00 (ФМИ)"
                    ul.appendChild(li);
                }
            })

            /* example of a ul element with two li elements: 
               Лекция: 09:00 - 11:00 (ФМИ)
               Упражнение: 12:00 - 15:00 (ФЗФ)
            */
    
            // append the generated information to the box
            scheduleDiv.appendChild(coursePar);
            scheduleDiv.appendChild(ul);
        }
    }
})()

// query the backend using a GET request in order to recieve the schedule of the user for today
function getTodaySchedule() {
    return fetch("../../backend/api/load_account_page/get_today_schedule.php")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        return data;
    })
}

// returns the name of the day in Bulgarian (parameter is a number from 1 to 7)
function getDayInText(day) {
    switch(day) {
        case 0:
            return "Неделя";
        case 1:
            return "Понеделник";
        case 2:
            return "Вторник";
        case 3:
            return "Сряда";
        case 4:
            return "Четвъртък";
        case 5:
            return "Петък";
        case 6:
            return "Събота";
    }
}

// returns the unique course names
function getUniqueDisciplines(schedules) {
    let unique = [];
    for (let i = 0; i < schedules.length; i++) {
        if (unique.indexOf(schedules[i]["discipline_name"]) == -1) { // if there is not an element with that value in the array "unique", then add it to the array
            unique.push(schedules[i]["discipline_name"]);
        }
    }
    return unique;
}