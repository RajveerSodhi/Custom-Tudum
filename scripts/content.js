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

// inject the custom tudum if the video is the main video and at the beginning and the sound has not been played yet and the OriginalFlix API returns true
function isInjectTudum(video) {
    if (isVideoBeginning(video)) {
        return isMainVideo(video) && isOriginal() && !tudumPlayed
    }

    return false
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

function isOriginal() {
    const title = getTitle()
    const isTitleOriginal = fetchOringinalFlix(title)
    return isTitleOriginal
}

async function fetchOringinalFlix(title) {
    const response = await fetch(`https://api.originalflix.dev/is-original?title=${encodeURIComponent(title)}&service=Netflix`)
    const data = await response.json();

    return data.exists
}

function getTitle() {
    const container = document.querySelector('.medium.ltr-m1ta4i'); 
    
    if (!container) {
        console.warn("No container element found");
        return null;
    }

    const heading = container.querySelector('h4');
    if (!heading) {
        console.warn("No h4 found inside container");
        return null;
    }
    
    let title = heading.textContent.trim(); 
    if (title.endsWith(':')) {
        title = title.slice(0, -1).trim();
    }
    
    return title;
}