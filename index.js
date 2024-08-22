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
  origin: ['http://localhost:3000','https://jobcom.website'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Jobcom website! Everything is working well sajith sathyan.");
});
app.use("/api/user-route", userRoute);
app.use("/api/admin-route", adminRoute);

// Disable strictQuery option
dbConnection
