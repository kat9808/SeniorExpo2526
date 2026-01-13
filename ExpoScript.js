let numButtonClicks = 0;

// Set random background on page load
window.addEventListener('DOMContentLoaded', function() {
    const backgrounds = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5'];
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    document.body.classList.add(randomBg);
});

function buttonClicked() {
    numButtonClicks = numButtonClicks + 1;
    document.getElementById("mainDiv").textContent =
        "Button Clicked times: " + numButtonClicks;
}
