const userModel = require("../model/auth-model");
const interviewerLiveModel = require("../model/interviewers-live-model");
const candidateLiveModel = require("../model/candidate-live-model");
const puppeteer = require("puppeteer");
const puppeteerJsNaukriConnection = require("../puppeteer/puppeteerNaukri");
const puppeteerJsLinkdinConnection = require("../puppeteer/puppeteerLinkdin");
const freeResumeModel= require("../model/freeResumeModel")
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
require("dotenv").config();

const maxAge = process.env.ACCESS_TOKEN_MAXAGE;
console.log(maxAge);
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
console.log(accessTokenSecret);

const CreateAccessToken = (id) => {
  return jwt.sign({ id }, accessTokenSecret, {
    expiresIn: maxAge,
  });
};

const handleErrors = (err) => {
  let errors = { username: "", email: "", password: "" };
  console.log("error------------------   ------------     ---------  " + err);
  console.log(err);
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  if (err.code === 11000) {
    errors.email = "Email is already registered";
    return errors;
  }

  if (err.message.includes("Users validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.register = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, password, username } = req.body;
   
    const status = "true"

    const user = await userModel.create({ email, password, username,status });


    const token = CreateAccessToken(user._id);
    console.log("token",token)

    res.status(201).json({ user: user, AccessToken: token });
    
  } catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.json({ errors, created: false });
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const user = await userModel.login(email, password);

    const token = CreateAccessToken(user._id);

    console.log(user);

    res.status(201).json({ user: user, AccessToken: token });
  } catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.json({ errors, created: false });
  }
};

module.exports.sendDataToInterviewerLiveDatabase = async (req, res) => {
  try {
    const { Token, HashTags } = req.body;
    const secretKey = process.env.ACCESS_TOKEN_SECRET;

    const decodedToken = jwt.verify(Token, secretKey);

    const user = await userModel.findById(decodedToken.id);
    const currentDate = new Date();
    const timestamp = Date.now();
    const newInterviewer = new interviewerLiveModel({
      user,
      hashTag: HashTags,
      date: currentDate,
      time: timestamp,
    });
    const newData = await newInterviewer.save();
    console.log(newData);
    const userId = newData._id;
    var UserEmail = newData.user.email;
    const listCandidatesByMatchingHashtags = async (userId) => {
      try {
        const interviewer = await interviewerLiveModel.findById(userId);
        const matchingHashtags = interviewer.hashTag;

        const candidates = await candidateLiveModel.aggregate([
          {
            $match: {
              hashTag: { $in: matchingHashtags },
              time: { $gte: interviewer.time },
              status: { $eq: "NotCall" },
            },
          },
          {
            $addFields: {
              matchingCount: {
                $size: {
                  $filter: {
                    input: "$hashTag",
                    cond: { $in: ["$$this", matchingHashtags] },
                  },
                },
              },
            },
          },
          {
            $sort: { matchingCount: -1 },
          },
        ]);

        console.log("candidates--***--->", candidates);
        return candidates;
      } catch (error) {
        console.log(error);
        // Handle the error
      }
    };
    let candidates = [];
    while (candidates.length === 0) {
      candidates = await listCandidatesByMatchingHashtags(userId);
      console.log("candidates--***->", candidates);

      // Add a delay before calling the function again
      await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds
    }

    console.log("candidates---candidates--->", candidates);

    if (candidates.length != 0) {
      const candidateDetials = await candidateLiveModel.findById(
        candidates[0]._id
      );
      console.log("candidateDetials----->", candidateDetials);
      function generateRandomRoomId(length) {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let roomId = "";

        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          roomId += characters.charAt(randomIndex);
        }

        return roomId;
      }
      const randomRoomId = generateRandomRoomId(6);
      candidateDetials.status = "OnCall";
      candidateDetials.roomId = randomRoomId;
      const saveRoomId = await candidateDetials.save();
      res.status(201).json({ saveRoomId: randomRoomId, email: UserEmail });
    }
  } catch (err) {
    console.log(err);
  }
};
module.exports.sendDataToCandidateLiveDatabase = async (req, res) => {
  try {
    const { Token, HashTags } = req.body;

    const secretKey = process.env.ACCESS_TOKEN_SECRET;

    const decodedToken = jwt.verify(Token, secretKey);

    const user = await userModel.findById(decodedToken.id);
    const currentDate = new Date();
    const timestamp = Date.now();
    const newCandidate = new candidateLiveModel({
      user,
      hashTag: HashTags,
      date: currentDate,
      time: timestamp,
      status: "NotCall",
      roomId: "",
    });
    const newData = await newCandidate.save();

    let CandidateWithRoomID = null;
    while (!CandidateWithRoomID || !CandidateWithRoomID.roomId) {
      CandidateWithRoomID = await candidateLiveModel.findById(newData._id);
      console.log("CandidateWithRoomID--205-->", CandidateWithRoomID);

      // Add a delay before calling the function again
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds
    }
    const email = newData.user.email;
    const roomId = CandidateWithRoomID.roomId;
    res.status(201).json({ email, roomId });
  } catch (err) {
    console.log(err);
  }
};

module.exports.jobSearchNaukri = async (req, res) => {
  try {
    console.log(req.body);
    const keyWord = req.body.keyword;

    const naukriData = await puppeteerJsNaukriConnection(keyWord);

    if (naukriData) {
      res.status(201).json({ naukriData });
    }
    // res.json({ success: true, data });
  } catch (error) {
    console.error("Error occurred:", error);
    // res.status(500).json({ success: false, error: "Error occurred during scraping." });
  }
};
module.exports.jobSearchLinkedin = async (req, res) => {
  try {
    console.log(req.body);
    const keyWord = req.body.keyword;

    const linkdinData = await puppeteerJsLinkdinConnection(keyWord);

    if (linkdinData) {
      console.log(
        "**************************linkdinData**********************************************",
        linkdinData
      );
      res.status(201).json({ linkdinData });
    }
    // res.json({ success: true, data });
  } catch (error) {
    console.error("Error occurred:", error);
    // res.status(500).json({ success: false, error: "Error occurred during scraping." });
  }
};

module.exports.createCheckoutSession = async (req, res) => {
  console.log(req.body);
  const stripe = Stripe(process.env.STRIPE_KEY);
  const YOUR_DOMAIN = "http://localhost:3000/success";
  const PRICE_ID = "pr_1234"; // Replace 'pr_1234' with the actual Price ID from your Stripe Dashboard
;
  try{
    
    const session = await stripe.checkout.sessions.create({
      
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'My product',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}`,
      cancel_url: `${YOUR_DOMAIN}/canceled`,
    });
   console.log(session.url)
   res.send({url:session.url})
    res.redirect(303, session.url);
  }catch(err){
    console.log(err)
  }
};
module.exports.createResume = (req,res)=>{
  console.log(req.body)
  const newResume = new freeResumeModel({
     resumeData:req.body
  })
  newResume.save()
    .then(savedResume => {
      // Handle success, e.g., send a response to the client
      res.status(201).json(savedResume);
    })
    .catch(error => {
      // Handle errors, e.g., send an error response
      res.status(500).json({ error: 'Error creating resume' });
    });
}

module.exports.getUser = async(req,res)=>{
  const accessToken = req.query.accessToken;
  console.log("accessToken-->",accessToken)

    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    try {
     
      const decodedToken = jwt.verify(accessToken, secretKey);
  
      user = await userModel.findById(decodedToken.id)
      console.log(user)
      res.status(201).json(user);
      // Handle the decoded token here
    } catch (error) {
      // Handle verification error
      console.error("JWT verification error:", error);
    }

   
 
    
 
}

module.exports.verifyPassword=async (req,res)=>{
  
  try{
    const password = req.body.password;
    const email = req.body.email;
    console.log("password-->",password)
    console.log("email-->",email)
    const user = await userModel.login(email, password);
    console.log(user)
    res.json({ status:"correct password"});
  }catch(err){
    const errors = handleErrors(err);
    console.log(errors)

    res.json({ errors, created: false });
    
  }
}