    const express = require("express");
    const adminRoute = express.Router();

    const adminController = require("../controllers/adminController")
   

    adminRoute.get("/get-user-detials",adminController.getUserDetials)
    adminRoute.get("/get-interview-details",adminController.getInterviewDetials)
    adminRoute.put("/block-user",adminController.blockUser)
    adminRoute.put("/unblock-user",adminController.unblockUser)

    module.exports = adminRoute;