/* When the user clicks on one of the options besides "Изход" and "Запази паркомясто" a different tab should show on the right hand side of the navbar.
   So we define which section should be displayed when an option is pressed */

(function() {
    const options = document.querySelectorAll("div.option"); // returns "Изход" option so we need to be careful not to add another event listener to it
    const sections = document.querySelectorAll("#account-tab > section");

    for (let option of options) {

        if (option.id == "reserve-spot" || option.id == "log-out") { // we shall add another event listener for "Запази паркомясто" option; skip the "Изход" option because we have another event listener fori t
            continue;
        }

        option.addEventListener("click", () => {
            for (let section of sections) {
                if (option.id + "-section" === section.id) { // display only the corresponding section
                    section.classList.remove("no-display");
                }
                else { // hide the rest
                    section.classList.add("no-display");
                }
            }
        });
    }

    const saveSpot = document.getElementById("reserve-spot");
    saveSpot.addEventListener("click", () => {
        window.location.href = "../map/zones.html"; // redirect user to zones.html with an option for back through the browser
    });
})();