document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("audio/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const audioData = e.target.result;
            const audio = new Audio(audioData);
            audio.onloadedmetadata = function () {
                if (audio.duration <= 8) { // Ensure the custom sound is less than or equal to 8 seconds
                    document.getElementById("saveButton").disabled = false;
                    document.getElementById("saveButton").onclick = function () {
                        chrome.storage.local.set({
                            customTudum: audioData,
                            customTudumDuration: audio.duration * 1000 // Store duration in milliseconds
                        }, function () {
                            document.getElementById("confirmation").style.display = "block";
                        });
                    };
                } else {
                    alert("Please upload an audio file that is 8 seconds or less.");
                }
            };
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid audio file.");
    }
});
