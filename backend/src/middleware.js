import jwt from 'jsonwebtoken';
export function auth(req,res,next){const h=req.headers.authorization||''; const token=h.startsWith('Bearer ')?h.slice(7):null; if(!token)return res.status(401).json({message:'Login required'}); try{req.user=jwt.verify(token,process.env.JWT_SECRET||'dev-secret');next()}catch{res.status(401).json({message:'Invalid or expired token'})}}
export function admin(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({message:'Admin access required'});next()}
