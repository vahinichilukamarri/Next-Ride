const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Student = require('./student');
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/attendance', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('Error connecting to MongoDB', err));


// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

app.use(cors({
  origin: 'http://127.0.0.1:5501'  // Only allow this specific origin
}));
const calculateAttendancePercentage = (attendanceHistory) => {
    const totalClasses = attendanceHistory.length;
    const attendedClasses = attendanceHistory.filter(record => record.status).length;
  
    return (attendedClasses / totalClasses) * 100;
  };
  
// API to mark attendance
// When a student scans the QR code to mark attendance
app.post('/api/scan-qr', async (req, res) => {
    const { scannedQRCode } = req.body;
    console.log('Scanned QR Code:', scannedQRCode);
  
    if (!scannedQRCode) {
      return res.status(400).json({ message: 'QR Code is required' });
    }
  
    try {
      let student = await Student.findOne({ rollNo: scannedQRCode });
  
      if (!student) {
        student = new Student({
          name: 'Unknown',
          phone: 'Unknown',
          rollNo: scannedQRCode,
          qrCode: scannedQRCode,
          attendanceHistory: [{ date: new Date(), status: true }],
        });
        await student.save();
        return res.status(201).json({ message: `New student added and attendance marked for ${scannedQRCode}` });
      }
  
      // Update attendanceHistory
      student.attendanceHistory.push({ date: new Date(), status: true });
  
      await student.save();
  
      return res.status(200).json({ message: `Attendance marked for ${scannedQRCode}` });
  
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });
  
// API to get student's attendance percentage
app.get('/api/attendance/:rollNo', async (req, res) => {
    const { rollNo } = req.params;
    try {
      const student = await Student.findOne({ rollNo });
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      const attendancePercentage = calculateAttendancePercentage(student.attendanceHistory);
  
      return res.status(200).json({ attendancePercentage });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });


// Start the server
const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
