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
        console.log(video);

        if (video.currentTime <= 60) {
            console.log("Video found less than 60s");
            chrome.runtime.sendMessage("runOffscreenTask");
            // creating offscreen document to play the custom sound
            // chrome.offscreen.createDocument({
            //     url: chrome.runtime.getURL("offscreen.html"),
            //     reasons: ["AUDIO_PLAYBACK"],
            //     justification: "Playing Custom Sound"
            // }, () => {
            //     chrome.runtime.sendMessage("playCustomSound");
            // });
        }

        return true;
    }
    return false;
}
