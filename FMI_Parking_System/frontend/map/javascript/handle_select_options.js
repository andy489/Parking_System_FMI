/* make it so whenever the user clicks on a start option, the end options will change accordingly - so that they start from the next hour until 21 */

(function() {

    const startSelect = document.getElementById("start-time"); // get the select element for the start hour
    const endSelectOptions = document.querySelectorAll("select#end-time option"); // get the options for the select containing the end hours
    
    startSelect.addEventListener("change", () => { // whenever the user changes the select value
        let currentValue = Number.parseInt(startSelect.value); // get the value of the selected option as a number

        // go through each option for the end hours and hide those options which have a value less than or equal to (<=) the selected option for the start hour, make the next hour selected
        endSelectOptions.forEach((option) => {
            let optionValue = Number.parseInt(option.value);
            if (optionValue <= currentValue) {
                option.setAttribute("hidden", "");
                option.setAttribute("disabled", "");
                option.removeAttribute("selected");
            }
            else if (optionValue == currentValue + 1) {
                option.setAttribute("selected", "");
                option.removeAttribute("hidden");
                option.removeAttribute("disabled");
            }
            else {
                option.removeAttribute("hidden"); // remove from previous selects
                option.removeAttribute("disabled"); // remove from previous selects
            }
        });
    })

})();