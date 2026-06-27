const HttpError=require('../models/http-error');
const jwt = require('jsonwebtoken');
module.exports=(req,res,next)=>{
    if(req.method==='OPTIONS') next();
    try{
        const token=req.headers.authorization.split(' ')[1]; // authorization => 'bearer token'
        if(!token){
            throw(new HttpError('authentication failed',401));
        }
        const decodedToken=jwt.verify(token,process.env.JWT_TOKEN);
        req.userData={userId:decodedToken.userId};
        next();
    }catch(err){
        return next(new HttpError('authentication failed',401));
    }
}
