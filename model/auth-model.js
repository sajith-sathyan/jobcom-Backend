const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        require:[true,"username is Required"],
       

    },
    email:{
        type:String,
        require:[true,'Email is Required'],
        unique:true
    },
    password:{
        type:String,
        require:[true,'Password is Required']
    },
    status:{
        type:String,
        require:[true,'status is Required']
    }
    
})


userSchema.pre('save',async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password,salt)
})

    userSchema.statics.login = async function(email,password){
        const user = await this.findOne({email})
        if(user){
            const auth = await bcrypt.compare(password,user.password)
            if(auth){
                return user;
            }
            throw Error("incorrect password")
        }
        throw Error ("incorrect email")
    }

    module.exports = mongoose.model("Users",userSchema)