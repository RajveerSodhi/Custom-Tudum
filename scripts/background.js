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
        console.log("Received message to run offscreen task");
        offScreenTask();
        return true;
    }
});

async function offScreenTask() {
    await setupOffscreenDocument();
    chrome.runtime.sendMessage({ sound: await getSound() });
    return true;
}

async function setupOffscreenDocument() {
    try {
        await chrome.offscreen.createDocument({
            url: chrome.runtime.getURL('../templates/offscreen.html'),
            reasons: ["AUDIO_PLAYBACK"],
            justification: "Playing Custom Sound",
        });
    } catch (error) {
        if (!error.message.startsWith('Only a single offscreen'))
            throw error;
    }
}

async function getSound() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("Sound", function (result) {
            let audio = result.Sound;
            if (audio) {
                console.log("Audio found");
                resolve(audio);
            } else {
                console.log("Audio not found");
                reject("Audio not found");
            }
        });
    });
}