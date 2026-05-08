import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userschema  = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    role:{
        type:String,
        enum:['user', 'admin'],
        default:'user'
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

userschema.pre('save', async function() {
    if(!this.isModified('password'))  return;

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt);
})

userschema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
};
export default mongoose.model('User',userschema);