const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const PORT = 5501;

// Middleware
app.use(cors());
app.use(express.json());

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
const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  busNumber: { type: String, required: true },
  date: { type: String, required: true },
  seats: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
});
const Booking = mongoose.model("Booking", BookingSchema);

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
app.post("/api/book-seat", async (req, res) => {
    const { userId, busNumber, date, seats } = req.body;
  
    // Validate the input
    if (!userId || !busNumber || !date || !seats || seats.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      // Save booking to the database
      const newBooking = new Booking({ userId, busNumber, date, seats });
      await newBooking.save();
  
      res.status(201).json({ message: "Seats booked successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error booking seats" });
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});