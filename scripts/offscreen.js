console.log("Offscreen script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Offscreen script received message:", message);

    if (message.action === "playSound") {
        playSound();
    }
});

function playSound() {
    chrome.storage.local.get("Sound", function (result) {
        let audio = result.Sound;
        if (audio) {
            console.log("Audio found");
            // Convert the data URI to a Blob
            fetch(audio)
                .then(response => response.blob())
                .then(blob => {
                    const audioUrl = URL.createObjectURL(blob);
                    const audioElement = new Audio(audioUrl);
                    audioElement.play().then(() => {
                        console.log("Audio played successfully");
                    }).catch(error => {
                        console.error("Error playing audio:", error);
                    });
                })
                .catch(error => {
                    console.error("Error converting audio data:", error);
                });
        } else {
            console.log("Audio not found");
        }
    });
}