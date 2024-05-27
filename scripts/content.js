// variable to control repetitive playing of custom tudum
let tudumPlayed = false;

// Try to find the video element immediately
if (!checkForVideoElement()) {
    // If not found, use a mutation observer to watch for changes
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                if (checkForVideoElement()) {
                    // Stop observing once the video element is found
                    observer.disconnect();
                    break;
                }
            }
        }
    });

    // Start observing the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });
}

function checkForVideoElement() {
    var video = document.querySelector("video");
    if (video) {
        // apply the event listener only once
        if (!video.hasAttribute('data-checked')) {
            video.setAttribute('data-checked', 'true');
            // add event listener to the video element to check if the video is at the beginning
            video.addEventListener('timeupdate', function () {
                if (isInjectTudum(video)) {
                    injectTudum(video)
                }
            });
        return true;
        }
        // check if the video is at the beginning once independently of the event listener
        if (isInjectTudum(video)) {
            injectTudum(video)
        }
    return false;
    }
}

// checks if the video is at the beginning
function isVideoBeginning(video) {
    return video.currentTime <= 1
}

// checks if the video is the main video or an ad (<30s)
function isMainVideo(video) {
    return video.duration > 30
}

// set tudumPlayed to true and then back to false after 3 seconds
async function toggleTudumPlayed() {
    tudumPlayed = true;
    await setTimeout(() => {
        tudumPlayed = false;
    }, 3000);
}

// inject the custom tudum if the video is the main video and at the beginning and the sound has not been played yet
function isInjectTudum(video) {
    return isMainVideo(video) && isVideoBeginning(video) && !tudumPlayed
}

// inject the custom tudum
function injectTudum(video) {
    muteVideo(video)
    toggleTudumPlayed();
    chrome.runtime.sendMessage("runOffscreenTask");
}

// mute video for 5 seconds
async function muteVideo(video) {
    video.muted = true;
    await setTimeout(() => {
        video.muted = false;
    }, 5000);
}