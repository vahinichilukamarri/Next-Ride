const express = require('express');
const mongoose = require('mongoose');
const MONGO_URI = "mongodb+srv://vahinich1236:Venkata%4002@mycluster.awk8l.mongodb.net/nextride?retryWrites=true&w=majority&appName=Mycluster";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("Error connecting to MongoDB:", error));

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  qrCode: { type: String, required: true },
});

const Student = mongoose.model('students', studentSchema);

const app = express();
app.use(express.json());

app.post('/scan-qr', async (req, res) => {
  const { scannedQRCode } = req.body;

  // Log the scanned QR code to check if it was received correctly
  console.log('Scanning QR Code:', scannedQRCode);

  if (!scannedQRCode) {
    return res.status(400).json({ message: 'QR Code is required' });
  }

  try {
    const student = await Student.findOne({ rollNo: scannedQRCode });

    // Log the result of the query to see if a student is found
    if (student) {
      console.log('Student found:', student);
      return res.json({ message: `Attendance marked for ${student.name} (${student.rollNo})` });
    } else {
      console.log('Student not found');
      return res.status(404).json({ message: 'Student not found in the database!' });
    }
  } catch (error) {
    console.error('Error processing the scan:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

const PORT = process.env.PORT || 5501;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
