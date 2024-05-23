// function injectContentScript(tabId) {
//     console.log("Injecting content script into tab", tabId);
//     chrome.scripting.executeScript({
//         target: { tabId: tabId },
//         files: ['scripts/content.js']
//     }, (result) => {
//         if (chrome.runtime.lastError) {
//             console.error("Script injection failed:", chrome.runtime.lastError.message);
//         } else {
//             console.log("Content script injected successfully");
//         }
//     });
// }

// function checkAndPlayTudum(tabId, duration) {
//     // Delay sending the message to ensure the content script is ready
//     setTimeout(() => {
//         // Send a message to the content script to check the video and play the custom Tudum sound
//         chrome.tabs.sendMessage(tabId, { action: 'checkVideoAndPlayTudum', duration: duration }, (response) => {
//             if (chrome.runtime.lastError) {
//                 console.error("Sending message failed:", chrome.runtime.lastError.message);
//             } else {
//                 console.log("Message sent to content script successfully");
//             }
//         });
//     }, 1000); // Delay of 1 second
// }

// // Listen for messages from the content script to mute/unmute the tab
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'muteTab') {
//         chrome.tabs.update(sender.tab.id, { muted: true }, () => {
//             console.log("Tab muted");
//         });
//     } else if (request.action === 'unmuteTab') {
//         chrome.tabs.update(sender.tab.id, { muted: false }, () => {
//             console.log("Tab unmuted");
//         });
//     }
// });

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//     if (changeInfo.status === "complete" && tab.url && tab.url.includes("netflix.com/watch/")) {
//         console.log("Netflix watch page loaded in tab", tabId);
//         injectContentScript(tabId);

//         // Retrieve the duration of the custom Tudum sound from storage
//         chrome.storage.local.get("tudumSoundDuration", function (result) {
//             let duration = result.tudumSoundDuration || 3000; // Default to 3 seconds if not set
//             console.log("Duration of the custom Tudum sound: " + duration + "ms");
//             checkAndPlayTudum(tabId, duration);
//         });
//     }
// });

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    if (info.status == "complete") {
        console.log("Tab updated");
        if (tab.url.indexOf("netflix.com/watch/") != -1) {

            chrome.tabs.update(tabId, { muted: true });

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['scripts/content.js']
            }, () => {
                console.log("Content script injected successfully");
            })
            // unmute tab after 8 seconds
            setTimeout(() => {
                chrome.tabs.update(tabId, { muted: false });
            }, 8000);

        }
    }
});