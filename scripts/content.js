// // Function to check the video's current time and play the custom Tudum sound
// function checkVideoAndPlayTudum(duration) {
//     console.log("Content script: checkVideoAndPlayTudum function called with duration:", duration);

//     let videoElements = document.getElementsByTagName('video');
//     if (videoElements.length > 0) {
//         let video = videoElements[0]; // Access the first video element
//         console.log("Content script: Video currentTime: " + video.currentTime);

//         if (video.currentTime <= 5) { // Check if the video is at the beginning
//             chrome.storage.local.get("tudumSound", function (result) {
//                 console.log("Content script: Retrieving custom Tudum sound from storage");

//                 if (result.tudumSound) {
//                     console.log("Content script: Custom Tudum sound found, playing sound");
//                     const audio = new Audio(result.tudumSound);

//                     // Mute the tab
//                     chrome.runtime.sendMessage({ action: 'muteTab' });

//                     // Play audio
//                     audio.play();

//                     // Unmute the tab after the custom audio has played
//                     setTimeout(function () {
//                         chrome.runtime.sendMessage({ action: 'unmuteTab' });
//                     }, duration);
//                 } else {
//                     console.log("Content script: Custom Tudum sound not found");
//                 }
//             });
//         } else {
//             console.log("Content script: Video is not at the beginning");
//         }
//     } else {
//         console.log("Content script: No video elements found");
//     }
// }

// // Listen for messages from the background script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'checkVideoAndPlayTudum') {
//         console.log("Content script: Received message to check video and play Tudum sound");
//         checkVideoAndPlayTudum(request.duration);
//     }
// });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "playAudio" && request.audioData) {
//         const audio = new Audio(request.audioData);
//         audio.play().then(() => {
//             console.log("Audio played successfully");
//         }).catch(error => {
//             console.error("Error playing audio:", error);
//         });
//         sendResponse({ status: "done" });
//     }
// });


function checkForVideoElement() {
    var video = document.querySelector("video");
    if (video) {
        console.log(video);
        document.body.innerHTML = "<h1>Video found</h1>";
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
