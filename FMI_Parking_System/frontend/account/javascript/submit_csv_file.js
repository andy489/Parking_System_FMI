(function() {
    const button = document.getElementById("upload-file"); // "Запази файл" button in "Моят график" tab
    const form = document.getElementById("upload-file-form"); // get the form

    button.addEventListener("click", (event) => {
        event.preventDefault();

        const file = document.getElementById("csv").files[0]; // get the file that was provided from the user

        // create formData which we can easily send over to the backend (creates a set of key-value pairs)
        const formData = new FormData();
        formData.append('csv', file); // key - csv, value - the input file

        const responseDiv = document.getElementById("upload-response");

        // send the file over to the backend
        fetch("../../backend/api/upload_csv/send_csv_to_db.php", {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // reset the form, removing the input file
            form.reset();

            // display a message for the user saying whether his file was successfully registered or not
            if (data["status"] == "SUCCESS") {
                responseDiv.classList.add("success");
                responseDiv.innerHTML = data["message"];
            }
            else {
                responseDiv.classList.add("error");
                throw new Error(data["message"]);
            }
        })
        .catch((errorResponse) => {
            responseDiv.innerHTML = errorResponse;
        })
        .finally(() => {
            // add animation
            responseDiv.classList.add("show-popup");
        
            // wait for show-popup's animation
            waitForAnimation(responseDiv)
            .then(() => {
                // remove the classes we just added to the response div to prepare it for the next time it is used again
                responseDiv.classList.remove("show-popup");
                responseDiv.classList.remove("error");
                responseDiv.classList.remove("success");
            })
        })
    })
})();

// create a Promise - waits for the show-popup's animation to finish
function waitForAnimation(div) {
    return div.getAnimations()[0].finished;
}