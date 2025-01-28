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
    chrome.runtime.sendMessage({ tudum: await getTudum(), volume: await getVolume() });
    return true;
}

// retrieve volume settings
async function getVolume() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("TudumVolume", function (result) {
            let volume = result.TudumVolume;
            if (volume) {
                console.log("volume found");
                resolve(volume);
            } else {
                console.log("volume not found");
                reject("volume not found");
            }
        });
    });
}

// create offscreen doc
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

// get saved audio file
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