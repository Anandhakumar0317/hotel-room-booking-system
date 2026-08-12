import mongoose from 'mongoose';
const roomSchema=new mongoose.Schema({roomNumber:{type:String,required:true},type:{type:String,default:'Standard'},price:{type:Number,required:true,min:0},capacity:{type:Number,default:2,min:1},images:[String],amenities:[String]});
const propertySchema=new mongoose.Schema({name:{type:String,required:true},location:{type:String,required:true},description:String,images:[String],amenities:[String],rating:{type:Number,default:4.5,min:0,max:5},rooms:[roomSchema]},{timestamps:true});
export default mongoose.model('Property',propertySchema);
