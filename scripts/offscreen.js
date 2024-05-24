if ('crbug.com/1185241') { // replace with a check for Chrome version that fixes the bug
    const { onMessage } = chrome.runtime, { addListener } = onMessage;
    onMessage.addListener = fn => addListener.call(onMessage, (msg, sender, respond) => {
        const res = fn(msg, sender, respond);
        if (res instanceof Promise) return !!res.then(respond, console.error);
        if (res !== undefined) respond(res);
    });
}

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