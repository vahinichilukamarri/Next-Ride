const express = require('express');
const router = express.Router();
const Student = require('./models/student');

// Endpoint to fetch all students
router.get('/getStudents', async (req, res) => {
  try {
    const students = await Student.find();  // Fetch all students from the database
    res.json(students);  // Return students as JSON
  } catch (err) {
    res.status(500).send('Database error');
  }
});

// Add more routes for other CRUD operations if needed
// For example, to add a new student:
router.post('/addStudent', async (req, res) => {
  try {
    const newStudent = new Student({
      name: req.body.name,
      address: req.body.address,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    });
    await newStudent.save();
    res.status(201).send('Student added successfully');
  } catch (err) {
    res.status(500).send('Failed to add student');
  }
});

module.exports = router;
