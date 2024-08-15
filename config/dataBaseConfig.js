const mongoose = require("mongoose");
require("dotenv").config();

const URL = process.env.MONGODB_URI;

mongoose
  .connect(URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

module.exports = mongoose.connection;
