const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dbConnection = require('./config/dataBaseConfig');
const userRoute = require("./routes/userRoutes");
const adminRoute = require("./routes/adminRoutes");
const socketHandler = require("./socketConnection/socketConnection");

require("dotenv").config();

// Apply CORS middleware before any other middleware or routes
const corsOptions = {
  origin: ['http://localhost:3000', 'https://jobcom.website', 'https://jobcom-backend.vercel.app'],
  credentials: true,
};
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Routes should come after middleware
app.get("/", (req, res) => {
  res.send("Welcome to the Jobcom website! Everything is working well.");
});
app.use("/api/user-route", userRoute);
app.use("/api/admin-route", adminRoute);

// Start server
const server = app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});

// Initialize socket.io with proper CORS configuration
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://jobcom.website', 'https://jobcom-backend.vercel.app'],
    credentials: true,
  },
});

// Call the socketHandler function and pass the `io` object
socketHandler(io);

// Connect to the database
dbConnection();
