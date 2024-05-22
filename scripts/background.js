function muteTudum(tabId, duration) {
    chrome.tabs.update(tabId, { muted: true }, () => {
        console.log("Tab muted");
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
                chrome.storage.local.get("tudumSound", function (result) {
                    if (result.tudumSound) {
                        const audio = new Audio(result.tudumSound);
                        audio.play();
                    }
                });
            }
        }, () => {
            // Set a timeout to unmute the tab after the custom audio has played
            setTimeout(function () {
                chrome.tabs.update(tabId, { muted: false });
                console.log("Tab unmuted");
            }, duration);
        });
    });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("netflix.com/watch/")) {
        // Retrieve the duration of the custom Tudum sound from storage
        chrome.storage.local.get("tudumSoundDuration", function (result) {
            let duration = result.tudumSoundDuration || 3000; // Default to 3 seconds if not set
            muteTudum(tabId, duration);
        });
    }
});
