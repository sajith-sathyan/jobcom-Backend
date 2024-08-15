const mongoose = require('mongoose');

const candidateLiveSchema =new mongoose.Schema({
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
    },
    status:{
        type:String
    },
    roomId:{
        type:String
    }

})
module.exports = mongoose.model("CANDIDATELIVE",candidateLiveSchema)