const mongoose = require('mongoose');

// Define the student schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
});

// Create a model based on the schema
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
