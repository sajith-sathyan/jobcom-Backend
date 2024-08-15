const express = require("express");
const userRoute = express.Router();
const {
  register,
  login,
  sendDataToInterviewerLiveDatabase,
  sendDataToCandidateLiveDatabase,
  jobSearchNaukri,
  jobSearchLinkedin,
  createCheckoutSession,
  createResume,
  getUser,
  verifyPassword
} = require("../controllers/userController");

// Define your user routes here    job-search job-search-linkedin get-user
userRoute.post("/register", register);
userRoute.post("/login", login);
userRoute.get("/get-user", getUser);
userRoute.post("/verify-password",  verifyPassword);
userRoute.post("/send-data-to-interviewerLive-database",sendDataToInterviewerLiveDatabase);
userRoute.post("/send-data-to-candidateLive-database",sendDataToCandidateLiveDatabase);
userRoute.post("/job-search-naukri",jobSearchNaukri);
userRoute.post("/job-search-linkedin",jobSearchLinkedin);
userRoute.post("/create-checkout-session",createCheckoutSession);
userRoute.post("/create-resume",createResume);

module.exports = userRoute;
