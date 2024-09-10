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

// Socket.io configuration with CORS
const server = app.listen(8000, "localhost", () => {
  console.log("Server is running on http://localhost:8000");
});

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://jobcom.website', 'https://jobcom-backend.vercel.app'],
    credentials: true,
  },
});

// Call the socketHandler function and pass the `io` object
socketHandler(io);

// Define CORS options for Express
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:3000', 'https://jobcom.website', 'https://jobcom-backend.vercel.app'];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow the request if the origin is in the list or if there's no origin (non-browser requests)
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request otherwise
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers)
};

// Enable CORS middleware
app.use(cors(corsOptions));

// Express JSON middleware
app.use(express.json());

// Define routes
app.get("/", (req, res) => {
  res.send("Welcome to the Jobcom website! Everything is working well.");
});

app.use("/api/user-route", userRoute);
app.use("/api/admin-route", adminRoute);

// Disable strictQuery option for Mongoose
dbConnection;
