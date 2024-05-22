// Function to check the video's current time and play the custom Tudum sound
function checkVideoAndPlayTudum(duration) {
    console.log("Content script: checkVideoAndPlayTudum function called with duration:", duration);
    let videoElements = document.getElementsByTagName('video');
    if (videoElements.length > 0) {
        let video = videoElements[0]; // Access the first video element
        console.log("Content script: Video currentTime: " + video.currentTime);
        if (video.currentTime <= 50) { // Check if the video is at the beginning
            chrome.storage.local.get("tudumSound", function (result) {
                console.log("Content script: Retrieving custom Tudum sound from storage");
                if (result.tudumSound) {
                    console.log("Content script: Custom Tudum sound found, playing sound");
                    const audio = new Audio(result.tudumSound);

                    // Mute the tab
                    chrome.runtime.sendMessage({ action: 'muteTab' });

                    // Play audio
                    audio.play();

                    // Unmute the tab after the custom audio has played
                    setTimeout(function () {
                        chrome.runtime.sendMessage({ action: 'unmuteTab' });
                    }, duration);
                } else {
                    console.log("Content script: Custom Tudum sound not found");
                }
            });
        } else {
            console.log("Content script: Video is not at the beginning");
        }
    } else {
        console.log("Content script: No video elements found");
    }
}

// Execute the function immediately with a default duration for testing
checkVideoAndPlayTudum(3000); // Default to 3 seconds for testing purposes
