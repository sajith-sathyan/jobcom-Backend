const userModel = require("../model/auth-model");
const candidateLiveModel = require("../model/candidate-live-model");
const interviewersLiveModel = require("../model/interviewers-live-model");

module.exports.getUserDetials = async (req, res) => {
  try {
    const userDetials = await userModel.find({});
    console.log(userDetials);

   
    res.status(200).json(userDetials);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.blockUser = async (req, res) => {
  console.log("blockUser");

  console.log(req.body);
  const { status, id } = req.body;

  try {
    const response = await userModel.findByIdAndUpdate(id, { status: false });

    console.log(response);

    if (!response) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User status updated successfully",
      updatedUser: response,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.unblockUser = async (req, res) => {
  console.log("unblockUser");
  console.log(req.body);

  const { status, id } = req.body;

  try {
    const response = await userModel.findByIdAndUpdate(id, { status: true });

    console.log(response);

    if (!response) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User status updated successfully",
      updatedUser: response,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports. getInterviewDetials = async (req,res)=>{
  try {
    const interviewersLive = await interviewersLiveModel.find();
    const candidateLive = await candidateLiveModel.find();
    res.status(200).json({ interviewersLive, candidateLive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching interview details.' });
  }
}
