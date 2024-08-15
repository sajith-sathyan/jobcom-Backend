const mongoose = require('mongoose');

const resumeModelDataBase =  new mongoose.Schema({
    resumeData:Object
})
module.exports = mongoose.model("FREERESUME",resumeModelDataBase)