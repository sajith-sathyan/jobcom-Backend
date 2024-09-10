const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dbConnection = require('./config/dataBaseConfig')
const userRoute = require("./routes/userRoutes");
const adminRoute = require("./routes/adminRoutes")
const socketHandler = require("./socketConnection/socketConnection");

require("dotenv").config();

const server = app.listen(8000, "localhost", () => {
  console.log("Server is running on http://localhost:8080");
});

const io = new Server(server, {
  cors: true,
});

// Call the socketHandler function and pass the `io` object
socketHandler(io);


const corsOptions = {
  origin: ["http://localhost:3000", "https://jobcom-backend.vercel.app", "https://jobcomwebsite11.pages.dev"],
  credentials: true,  // This allows cookies and other credentials to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Add all methods you want to allow
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));  // Allows all routes to handle OPTIONS method

app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:3000", "https://jobcom-backend.vercel.app", "https://jobcomwebsite11.pages.dev"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);  // Dynamically set the allowed origin
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});



app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Jobcom website! ");
});
app.use("/api/user-route", userRoute);
app.use("/api/admin-route", adminRoute);

// Disable strictQuery option
dbConnection
