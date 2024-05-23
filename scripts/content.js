function playCustomTudum() {
    chrome.storage.local.get("customTudum", function (result) {
        let audio = result.customTudum;
        if (audio) {
            console.log("Audio found");
            // Convert the data URI to a Blob
            fetch(audio)
                .then(response => response.blob())
                .then(blob => {
                    const audioUrl = URL.createObjectURL(blob);
                    const audioElement = new Audio(audioUrl);
                    audioElement.play().then(() => {
                        console.log("Audio played successfully");
                    }).catch(error => {
                        console.error("Error playing audio:", error);
                    });
                })
                .catch(error => {
                    console.error("Error converting audio data:", error);
                });
        } else {
            console.log("Audio not found");
        }
    });
}

function checkForVideoElement() {
    var video = document.querySelector("video");
    if (video) {
        console.log(video);

        if (video.currentTime <= 60) {
            console.log("Video found less than 60s");
            playCustomTudum();
        }

        return true;
    }
    return false;
}

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
