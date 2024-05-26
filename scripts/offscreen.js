chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Offscreen script received message:", message);

    if (sound in message) {
        console.log("Playing sound:", sound);
        playSound(sound);
    }
});

function playSound(audio) {
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
}