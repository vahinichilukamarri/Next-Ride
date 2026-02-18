const mongoose = require('mongoose');

// Updated Schema to handle attendance marking
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  qrCode: { type: String, required: true }, // This can store a path or data related to the QR
  attendanceMarked: { type: Boolean, default: false }, // Indicates if attendance is marked
  attendanceHistory: [
    {
      date: { type: Date, required: true },
      status: { type: Boolean, required: true },  // true = attended, false = absent
    }
  ],
});

module.exports = mongoose.model('Student', studentSchema);
