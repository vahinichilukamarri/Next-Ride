const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const studentRoutes = require("./students");

const app = express();
const PORT = 5501;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://vahinich1236:Venkata%4002@mycluster.awk8l.mongodb.net/nextride?retryWrites=true&w=majority&appName=Mycluster";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// User Schema and Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'driver'] },
});
const User = mongoose.model("User", UserSchema);

// Booking Schema and Model
const bookingSchema = new mongoose.Schema({
  seats: [String],
  travelDate: String,
  startLocation: String,
  busNumber: String,
  passengerCount: Number,
  bookedAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model('Booking', bookingSchema);

// ContactInfo Schema and Model
const ContactInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String },
  address: { type: String },
});
const ContactInfo = mongoose.model("ContactInfo", ContactInfoSchema);

// Define Absentee Schema
const absenteeSchema = new mongoose.Schema({
  userId: String,
  studentName: String,
  date: { type: Date, default: Date.now }
});

const Absentee = mongoose.model("Absentee", absenteeSchema);
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
const Students = mongoose.model("Students", studentSchema);
// Endpoints
app.post("/signup", async (req, res) => {
  // Sign-up logic
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required" });
  }

  if (!['student', 'driver'].includes(role)) {
    return res.status(400).json({ message: "Invalid role. Role must be 'student' or 'driver'." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully Login from homepage!" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post("/login", async (req, res) => {
  // Log-in logic
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Respond with user details including role
    res.status(200).json({ name: user.name, userId: user._id, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/api/student-name/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Booking logic
// Seat Booking Endpoint
// app.post("/api/book-seat", async (req, res) => {
//   const { userId, busNumber, date, seats } = req.body;

//   // Validate the input
//   if (!userId || !busNumber || !date || !seats || seats.length === 0) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     // Save booking to the database
//     const newBooking = new Booking({ userId, busNumber, date, seats });
//     await newBooking.save();

//     res.status(201).json({ message: "Seats booked successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error booking seats" });
//   }
// });
app.post('/api/book-seats', async (req, res) => {
  try {
    const { seats, travelDate, startLocation, busNumber, passengerCount } = req.body;

    if (!seats || !travelDate || !startLocation || !busNumber || passengerCount === undefined) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Check if any of the requested seats are already booked
    const existingBookings = await Booking.findOne({
      busNumber,
      travelDate,
      seats: { $in: seats }, // Check if any requested seat is already booked
    });

    if (existingBookings) {
      return res.status(409).json({ message: 'Some seats are already booked', bookedSeats: existingBookings.seats });
    }

    // Book the seats
    const newBooking = new Booking({
      seats,
      travelDate,
      startLocation,
      busNumber,
      passengerCount,
    });

    await newBooking.save();
    res.status(201).json({ message: 'Seats booked successfully', booking: newBooking });
  } catch (error) {
    console.error('Error booking seats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/api/booked-seats", async (req, res) => {
  // Fetch booked seats logic
  const { busNumber, date } = req.query;

  if (!busNumber || !date) {
    return res.status(400).json({ message: "Bus number and date are required" });
  }

  try {
    const bookings = await Booking.find({ busNumber, date });
    const bookedSeats = bookings.flatMap((booking) => booking.seats);

    res.json({ bookedSeats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching booked seats" });
  }
});

// Contact Info Endpoints

// Fetch Contact Info
// Fetch Contact Info with Name and Email
app.get("/api/contact-info/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Retrieve ContactInfo and User information
    const contactInfo = await ContactInfo.findOne({ userId });
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Merge user data with contact info
    const response = {
      name: user.name,
      email: user.email,
      phone: contactInfo?.phone || "",
      address: contactInfo?.address || "",
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Update Contact Info
app.put("/api/contact-info/:userId", async (req, res) => {
  const { userId } = req.params;
  const { phone, address } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    let contactInfo = await ContactInfo.findOne({ userId });

    if (!contactInfo) {
      // Create a new ContactInfo record
      contactInfo = new ContactInfo({ userId, phone, address });
    } else {
      // Update existing ContactInfo
      contactInfo.phone = phone || contactInfo.phone;
      contactInfo.address = address || contactInfo.address;
    }

    await contactInfo.save();
    res.status(200).json({ message: "Contact information updated successfully" });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// POST endpoint to add absentee
app.post("/api/absentees", async (req, res) => {
  try {
      const absentee = new Absentee(req.body);
      await absentee.save();
      res.status(201).send({ message: "Absentee recorded successfully" });
  } catch (err) {
      res.status(500).send({ error: "Failed to record absentee" });
  }
});

// GET endpoint to fetch all absentees
app.get("/api/absentees", async (req, res) => {
  try {
      const absentees = await Absentee.find();
      res.status(200).send(absentees);
  } catch (err) {
      res.status(500).send({ error: "Failed to fetch absentees" });
  }
});
// DELETE endpoint to clear all absentees
app.delete("/api/absentees", async (req, res) => {
  try {
      await Absentee.deleteMany(); // Deletes all records in the collection
      res.status(200).send({ message: "All notifications cleared successfully." });
  } catch (err) {
      res.status(500).send({ error: "Failed to clear notifications." });
  }
});
app.post('api/scan-qr', async (req, res) => {
  const { scannedQRCode } = req.body;

  if (!scannedQRCode) {
    return res.status(400).json({ message: 'QR Code is required' });
  }

  try {
    const student = await Students.findOne({ rollNo: scannedQRCode });

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
// API to get student's attendance percentage
app.get('/api/attendance/:rollNo', async (req, res) => {
    const { rollNo } = req.params;
    try {
      const student = await Students.findOne({ rollNo });
  
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


// Routes
//app.use('/api/students', studentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
