const mongoose = require('mongoose');

const interviewerLiveSchema =new mongoose.Schema({
    user:{
        type:Object
    },
    hashTag:{
        type:Array
    },
    date:{
        type:String
    },
    time:{
        type:String
    }

})
module.exports = mongoose.model("INTERVIEWERLIVE",interviewerLiveSchema)