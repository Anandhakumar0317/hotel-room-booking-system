import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true},email:{type:String,required:true,unique:true,lowercase:true},passwordHash:String,role:{type:String,enum:['user','admin'],default:'user'},phone:{type:String,default:''},avatar:{type:String,default:''}},{timestamps:true});
export default mongoose.model('User',schema);
