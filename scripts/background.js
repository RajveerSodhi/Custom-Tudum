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

            // keep  the tab muted until the custom Tudum sound has played + remainder of 8 seconds
            chrome.storage.local.get("customTudumDuration", function (result) {
                let duration = result.customTudumDuration || 0;
                console.log("Duration of the custom Tudum sound: " + duration + "ms");
                setTimeout(() => {
                    chrome.tabs.update(tabId, { muted: false });
                }, (8000 - duration));
            });

        }
    }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message === "runOffscreenTask") {
        await setupOffscreenDocument('offscreen.html');
        chrome.runtime.sendMessage("playCustomSound");
    }
});

let creating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument() {
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const offscreenUrl = chrome.runtime.getURL("offscreen.html");
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
        return;
    }

    // create offscreen document
    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: chrome.runtime.getURL("offscreen.html"),
            reasons: ["AUDIO_PLAYBACK"],
            justification: "Playing Custom Sound",
        });
        await creating;
        creating = null;
    }
}