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
        muteAudio(tabId);
        injectContentScript(tabId);
    }
});

function injectContentScript(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['scripts/content.js']
    }, () => {
        console.log("Content script injected successfully");
    });
}

async function muteAudio(tabId) {
    chrome.tabs.update(tabId, { muted: true })
    console.log("Tab muted");
    await setTimeout(() => {
        chrome.tabs.update(tabId, { muted: false })
        console.log("Tab unmuted");
    }, 5000);
}

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
    chrome.runtime.sendMessage({ tudum: await getTudum() });
    return true;
}

async function setupOffscreenDocument() {
    try {
        await chrome.offscreen.createDocument({
            url: chrome.runtime.getURL('../templates/offscreen.html'),
            reasons: ["AUDIO_PLAYBACK"],
            justification: "Playing Custom Tudum",
        });
    } catch (error) {
        if (!error.message.startsWith('Only a single offscreen'))
            throw error;
    }
}

async function getTudum() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("Tudum", function (result) {
            let audio = result.Tudum;
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