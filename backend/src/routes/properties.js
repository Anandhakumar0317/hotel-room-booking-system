import {Router} from 'express';import Property from '../models/Property.js';import Booking from '../models/Booking.js';import {auth,admin} from '../middleware.js';
const r=Router();
const available=async(p,from,to)=>{const bs=await Booking.find({property:p._id,status:'confirmed',checkIn:{$lt:to},checkOut:{$gt:from}}).select('roomId');const busy=new Set(bs.map(x=>String(x.roomId)));return {...p.toObject(),rooms:p.rooms.filter(x=>!busy.has(String(x._id)))};};
r.get('/',async(req,res)=>{try{const {location,checkIn,checkOut}=req.query;const q=location?{location:{$regex:location,$options:'i'}}:{};const ps=await Property.find(q).sort({createdAt:-1});if(!checkIn||!checkOut)return res.json(ps);const from=new Date(checkIn),to=new Date(checkOut);if(!(from<to))return res.status(400).json({message:'Invalid date range'});res.json(await Promise.all(ps.map(p=>available(p,from,to))));}catch(e){res.status(500).json({message:e.message})}});
r.get('/:id',async(req,res)=>{const p=await Property.findById(req.params.id);if(!p)return res.status(404).json({message:'Property not found'});res.json(p)});
r.post('/',auth,admin,async(req,res)=>{try{res.status(201).json(await Property.create(req.body))}catch(e){res.status(400).json({message:e.message})}});
r.put('/:id',auth,admin,async(req,res)=>{try{const p=await Property.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});res.json(p)}catch(e){res.status(400).json({message:e.message})}});
r.delete('/:id',auth,admin,async(req,res)=>{await Property.findByIdAndDelete(req.params.id);res.json({message:'Property deleted'})});
export default r;
