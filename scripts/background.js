// Fix for crbug.com/1185241
if (typeof chrome.runtime.onMessage !== "undefined") {
    const { onMessage } = chrome.runtime;
    const { addListener } = onMessage;
    onMessage.addListener = fn => addListener.call(onMessage, (msg, sender, respond) => {
        const res = fn(msg, sender, respond);
        if (res instanceof Promise) return !!res.then(respond, console.error);
        if (res !== undefined) respond(res);
    });
}

// Re-inject content scripts on extension install/update
chrome.runtime.onInstalled.addListener(async () => {
    const contentScripts = chrome.runtime.getManifest().content_scripts;
    for (const cs of contentScripts) {
        const tabs = await chrome.tabs.query({ url: cs.matches });
        for (const tab of tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: cs.all_frames },
                files: cs.js,
                injectImmediately: cs.run_at === 'document_start',
            });
        }
    }
});

// Tab update listener
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    if (info.status === "complete" && tab.url.indexOf("netflix.com/watch/") !== -1) {
        chrome.tabs.update(tabId, { muted: true });

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['scripts/content.js']
        }, () => {
            console.log("Content script injected successfully");
        });

        chrome.storage.local.get("soundDuration", function (result) {
            let duration = result.soundDuration || 0;
            console.log("Duration of the sound: " + duration + "ms");
            setTimeout(() => {
                chrome.tabs.update(tabId, { muted: false });
            }, (8000 - duration));
        });
    }
});

// Message listener for offscreen task
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === "runOffscreenTask") {
        offScreenTask();
        return true;
    }
});

async function offScreenTask() {
    await setupOffscreenDocument('offscreen.html');
    chrome.runtime.sendMessage("playSound");
    return true;
}

let creating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument() {
    const offscreenUrl = chrome.runtime.getURL("offscreen.html");
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
        return;
    }

    if (creating) {
        await creating;
    } else {
        creating = chrome.offscreen.createDocument({
            url: offscreenUrl,
            reasons: ["AUDIO_PLAYBACK"],
            justification: "Playing Custom Sound",
        });
        await creating;
        creating = null;
    }
}
