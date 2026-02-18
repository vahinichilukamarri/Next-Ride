const video = document.getElementById("video");
const notifications = document.getElementById("notifications");

// Access the camera and start the video stream
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        console.error("Camera access denied:", err);
        alert("Unable to access the camera. Please allow camera permissions.");
    });

// Create a canvas to extract image from the video feed
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

function scanQRCode() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
        markAttendance(code.data);  // Mark attendance when QR code is detected
    }
}

// QR code scanner logic
function markAttendance(studentID) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerHTML = `
        <i>✔</i>
        <span>Attendance marked for Student ID: <strong>${studentID}</strong>.</span>
    `;
    notifications.appendChild(notification);

    // Send the scanned QR code (studentID) to the backend to be saved in MongoDB
    fetch('http://localhost:5501/api/scan-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannedQRCode: studentID }), // Send student ID to backend
    })
    .then(response => response.json())
    .then(data => {
        // Request the attendance percentage after marking attendance
        fetch(`http://localhost:5501/api/attendance/${studentID}`)
            .then(response => response.json())
            .then(data => {
                notification.innerHTML = `
                    <i>✔</i>
                    <span>${data.message} Attendance Percentage: ${data.attendancePercentage.toFixed(2)}%</span>
                `;
            })
            .catch(error => {
                console.error('Error fetching attendance percentage:', error);
                notification.innerHTML = `
                    <i>❌</i>
                    <span>Error fetching attendance percentage.</span>
                `;
            });
    })
    .catch(error => {
        console.error('Error:', error);
        notification.innerHTML = `
            <i>❌</i>
            <span>Error marking attendance.</span>
        `;
    });

    console.log('Received QR Code:', studentID);  // Log student ID
}

// Start scanning every 500ms
const scanInterval = setInterval(scanQRCode, 500);  // Scan every 500ms

// Optional: Stop scanning when leaving the page or if it's no longer needed
window.addEventListener('beforeunload', () => {
    clearInterval(scanInterval);
});
