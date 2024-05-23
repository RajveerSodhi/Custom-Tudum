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