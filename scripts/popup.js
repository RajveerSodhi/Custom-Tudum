document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get(["Tudum", "TudumName", "TudumVolume"], function(result) {
        if (result.TudumName) {
            document.getElementById("current-sound-name").textContent = result.TudumName;
            document.getElementById("testAudioButton").disabled = false;
        }
        if (result.TudumVolume) {
            document.getElementById("myRange").value = result.TudumVolume;
        }
    });
});

document.getElementById("fileInput").addEventListener("change", function() {
    document.getElementById("saveButton").disabled = false;
});

document.getElementById("saveButton").addEventListener("click", function() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (file && file.type.startsWith("audio/")) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const audioData = e.target.result;
            const audio = new Audio(audioData);
            audio.onloadedmetadata = function() {
                if (audio.duration <= 5) { // Ensure the custom tudum is less than or equal to 5 seconds
                    const volume = document.getElementById("myRange").value;
                    chrome.storage.local.set({
                        Tudum: audioData,
                        TudumName: file.name,
                        TudumVolume: volume
                    }, function() {
                        document.getElementById("confirmation").style.display = "block";
                        document.getElementById("current-sound-name").textContent = file.name;
                        document.getElementById("testAudioButton").disabled = false;
                    });
                } else {
                    document.getElementById("error-long").style.display = "block";
                }
            };
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById("error-invalid").style.display = "block";
    }
});

document.getElementById("myRange").addEventListener("input", function(event) {
    const volume = event.target.value;
    chrome.storage.local.set({ TudumVolume: volume });
});

document.getElementById("testAudioButton").addEventListener("click", function() {
    chrome.storage.local.get(["Tudum", "TudumVolume"], function(result) {
        if (result.Tudum) {
            const audio = new Audio(result.Tudum);
            audio.volume = result.TudumVolume / 100; // Adjust volume based on stored value
            audio.play();
        }
    });
});