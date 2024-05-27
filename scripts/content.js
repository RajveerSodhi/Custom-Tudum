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
        console.log("video found");
        if (isMainVideo && isVideoBeginning(video)) {
            // asking background.js to create an offscreen document and play the sound
            chrome.runtime.sendMessage("runOffscreenTask");
        }

        return true;
    }
    return false;
}

// checks if the video is at the beginning
function isVideoBeginning(video) {
    return video.currentTime <= 2
}

// checks if the video is the main video or an ad (<30s)
function isMainVideo(video) {
    return video.duration > 30
}