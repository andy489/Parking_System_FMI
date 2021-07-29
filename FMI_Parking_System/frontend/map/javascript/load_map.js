let slideIndex = 1; // keeps track of the current slide number
const maxSlots = 10; // maximum slots per zone
const maxOptions = 14, startTime = 7; // maximum options per select field and start time of the 

let zoneNames = {
    1: "A",
    2: "B",
    3: "C",
    4: "D"
}

const startSelect = document.getElementById("start-time"); // select for start time of the time interval
const endSelect = document.getElementById("end-time"); // select for end time of the time interval

for (let i = 0; i < maxOptions; i++) {
    // dynamically create each option and add it to the corresponding option
    let opt = document.createElement("option");
    opt.value = startTime + i; // go from 7 to 20
    opt.textContent = startTime + i;
    startSelect.appendChild(opt);

    opt = document.createElement("option");
    opt.value = startTime + i + 1; // go from 8 to 21
    opt.textContent = startTime + i + 1;
    endSelect.appendChild(opt);
}

const backBtn = document.getElementById("back-btn"); // get back button which will take user to the the account page
backBtn.addEventListener('click', () => {
    window.location.replace("../account/account_view.html");
})

// when the page is loaded, show the first slide and create the buttons for zone A
showSlides(slideIndex);
createSlotsButtons();

// when the user has clicked one of the arrows on the slideshow (for previous or next slide), then change the current slide and put the new buttons for the new current zone slots
function plusSlides(n) {
    showSlides(slideIndex += n);
    showZoneButtons(slideIndex);
}

// when the user has clicked on one of the zone buttons, change the current slide to the corresponding one and put the new corresponding buttons for the slots
function currentSlide(n) {
    showSlides(slideIndex = n);
    showZoneButtons(slideIndex);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides"); // gets all the slides
    let dots = document.getElementsByClassName("btn"); // gets the buttons for the zones

    if (n > slides.length) { // if the user was on the 4th slide and wants to go to the next one, head over to the first one
        slideIndex = 1;
    }

    if (n < 1) { // if the user was on the 1st slide and wants to go to the previous one, head over to the last one
        slideIndex = slides.length;
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none"; // hide all the slides
    }

    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace("active", ""); // make all zone buttons inactive
    }

    slides[slideIndex - 1].style.display = "block"; // display the current slide
    dots[slideIndex - 1].className += " active"; // make the current button active (the corresponding zone button)
}

function createSlotsButtons() {
    const main = document.body.querySelector("main");

    for (let zoneIndex in zoneNames) {
        let zoneName = zoneNames[zoneIndex]; // returns "A", "B", "C" and "D"

        let zoneContainer = document.createElement("div"); // create container of buttons for the specific zone
        zoneContainer.id = zoneName;
        zoneContainer.classList.add("slots-container");

        if (zoneName == "A") { // displays zone A's buttons by default
            zoneContainer.style.display = "block";
        }
        else {
            zoneContainer.style.display = "none";
        }

        let firstRow = document.createElement("div"); // div containing the first row of buttons
        firstRow.classList.add("row-btns");

        let secondRow = document.createElement("div"); // div containing the second row of buttons
        secondRow.classList.add("row-btns");
        
        for (let i = 0; i < maxSlots; i++) {
            // create the buttons and append them to their corresponding row
            let button = document.createElement("button");
            button.textContent = zoneName + i;
            button.classList.add("slots-btn");
    
            if (i < maxSlots / 2) {
                firstRow.appendChild(button);
            }
            else {
                secondRow.appendChild(button);
            }
        }

        // append the two rows to the container
        zoneContainer.appendChild(firstRow);
        zoneContainer.appendChild(secondRow);

        main.appendChild(zoneContainer);
    }
}

function showZoneButtons(slideIndex) {
    const buttonContainers = document.body.querySelectorAll("div.slots-container"); // the containers with the buttons for each zone (4 zones)

    buttonContainers.forEach((container) => { // each container
        if (container.id == zoneNames[slideIndex]) {
            container.style.display = "block";
        }
        else {
            container.style.display = "none";
        }
    });
}