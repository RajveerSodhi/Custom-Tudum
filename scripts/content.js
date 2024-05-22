// This script will be executed by the background script to play the custom Tudum sound
chrome.storage.local.get("tudumSound", function (result) {
    if (result.tudumSound) {
        const audio = new Audio(result.tudumSound);
        audio.play();
    }
});
