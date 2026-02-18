const mongoose = require("mongoose");

// MongoDB URI
const MONGO_URI = "mongodb://127.0.0.1:27017/locationshape";

// Define the schema
const locationSchema = new mongoose.Schema({
  loc: {
    type: { type: String, required: true, default: "Point" }, // Must be "Point" for GeoJSON
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (coords) {
          return coords.length === 2;
        },
        message: "Coordinates should have exactly two values: [longitude, latitude].",
      },
    },
  },
  pos: {
    type: [Number], // Array of numbers for 2d indexing
    required: true,
  },
});

// Create the 2dsphere index for the 'loc' field
locationSchema.index({ loc: "2dsphere" });

// Create the 2d index for the 'pos' field
locationSchema.index({ pos: "2d" });

// Define the model
const Location = mongoose.model("Location", locationSchema);

// Function to create indexes
async function createIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Sync indexes with MongoDB
    await Location.syncIndexes();
    console.log("Indexes created successfully.");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Function to insert locations
const insertLocations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Insert data using Mongoose
    const locations = [
      {
        rollNumber: "202",
        name: "Sita Iyer",
        loc: { type: "Point", coordinates: [78.4056, 17.4625] },
        pos: [78.4056, 17.4625],
      },
      {
        rollNumber: "203",
        name: "Ravi Kumar",
        loc: { type: "Point", coordinates: [78.4711, 17.3850] },
        pos: [78.4711, 17.3850],
      },
      {
        rollNumber: "204",
        name: "Asha Reddy",
        loc: { type: "Point", coordinates: [78.4821, 17.3935] },
        pos: [78.4821, 17.3935],
      },
      {
        rollNumber: "205",
        name: "Vikram Rao",
        loc: { type: "Point", coordinates: [78.3987, 17.4448] },
        pos: [78.3987, 17.4448],
      },
      {
        rollNumber: "206",
        name: "Meera Shenoy",
        loc: { type: "Point", coordinates: [78.5012, 17.4833] },
        pos: [78.5012, 17.4833],
      },
    ];

    await Location.insertMany(locations);
    console.log("Locations inserted successfully");
  } catch (error) {
    console.error("Error inserting locations:", error.message);
  }
//   } finally {
//     // Close the connection
//     await mongoose.disconnect();
//     console.log("Disconnected from MongoDB");
//   }
};

// Run the functions
(async () => {
  await createIndexes();
  await insertLocations();
})();
