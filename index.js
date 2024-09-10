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

const server = app.listen(8000, "localhost", () => {
  console.log("Server is running on http://localhost:8000");
});

const io = new Server(server, {
  cors: true,
});

// Call the socketHandler function and pass the `io` object
socketHandler(io);

// Define a CORS Middleware Function
const allowCors = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

// Use the CORS Middleware
app.use(allowCors);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Jobcom website!");
});

app.use("/api/user-route", userRoute);
app.use("/api/admin-route", adminRoute);

// Disable strictQuery option
dbConnection;
