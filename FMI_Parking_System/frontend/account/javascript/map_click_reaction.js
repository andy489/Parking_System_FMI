/* when the user clicks on the map to zoom-in, add class zoom-in-effect to make this happen
   and then after the user clicks again this time to zoom-out, remove the zoom-in-effect and add class zoom-out-effect */

(function() {
    const map = document.querySelector("#parking-zones-section img");

    map.addEventListener("click", () => {
        if (map.classList.contains("zoom-in-effect")) {
            map.classList.remove("zoom-in-effect");
            map.classList.add("zoom-out-effect");
        }
        else {
            map.classList.add("zoom-in-effect");
            map.classList.remove("zoom-out-effect");
        }
    });
})();