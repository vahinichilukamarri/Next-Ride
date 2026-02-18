const express = require('express');
const Student = require('./student');
const router = express.Router();

// Scan QR code and mark attendance
router.post('/scan-qr', async (req, res) => {
  const { scannedQRCode } = req.body;

  if (!scannedQRCode) {
    return res.status(400).json({ message: 'QR Code is required' });
  }

  try {
    const student = await Student.findOne({ rollNo: scannedQRCode });

    if (student) {
      // Add logic for marking attendance (e.g., add timestamp in an attendance collection)
      return res.json({ message: `Attendance marked for ${student.name} (${student.rollNo})` });
    } else {
      return res.status(404).json({ message: 'Student not found in the database!' });
    }
  } catch (error) {
    console.error('Error processing the scan:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
