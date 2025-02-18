document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".gallery-item").forEach(item => {
        const imgOff = item.querySelector(".img-off");
        const imgOn = item.querySelector(".img-on");

        item.addEventListener("mouseenter", () => {
            imgOff.style.opacity = "0";
            imgOn.style.opacity = "1";
        });

        item.addEventListener("mouseleave", () => {
            imgOff.style.opacity = "1";
            imgOn.style.opacity = "0";
        });
    });
});