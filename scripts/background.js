function injectAndCheckVideo(tabId, duration) {
    console.log("Injecting content script into tab", tabId);
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['scripts/content.js'] // Inject the content script file
    }, (result) => {
        if (chrome.runtime.lastError) {
            console.error("Script injection failed:", chrome.runtime.lastError.message);
        } else {
            console.log("Script injected successfully", result);
        }
    });
}

// Listen for messages from the content script to mute/unmute the tab
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'muteTab') {
        chrome.tabs.update(sender.tab.id, { muted: true }, () => {
            console.log("Tab muted");
        });
    } else if (request.action === 'unmuteTab') {
        chrome.tabs.update(sender.tab.id, { muted: false }, () => {
            console.log("Tab unmuted");
        });
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("netflix.com/watch/")) {
        console.log("Netflix watch page loaded in tab", tabId);
        // Retrieve the duration of the custom Tudum sound from storage
        chrome.storage.local.get("tudumSoundDuration", function (result) {
            let duration = result.tudumSoundDuration || 3000; // Default to 3 seconds if not set
            console.log("Duration of the custom Tudum sound: " + duration + "ms");
            injectAndCheckVideo(tabId, duration);
        });
    }
});
