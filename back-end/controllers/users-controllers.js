const uuid=require('uuid');
const uuidv4=uuid.v4;
const HttpError = require('../models/http-error');
const {validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User = require('../models/user');



const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({users: users.map(user => user.toObject({ getters: true }))});
};


const signUp = async (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const { name, email, password} = req.body;
    const image = req.file.path.replace(/\\/g, '/');
    console.log(image)
    let existingUser;
    try {
      existingUser = await User.findOne({ email: email })
    } catch (err) {
      const error = new HttpError(
        'Signing up failed, please try again later.',
        500
      );
      return next(error);
    }
  
  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }
  let hashedPassword
  try{
    hashedPassword=await bcrypt.hash(password,12);
    }catch(err){
      next(new HttpError("couldn't create a user",500))
    }
  const createdUser = new User({
    name,
    email,
    image:process.env.DOMAIN+req.file.path,
    password:hashedPassword,
    places:[]
  });

  try {
    await createdUser.save();
    //console.log("BODY:", req.body);
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }
  let token;
  try{
    token=jwt.sign({userId:createdUser.id,email:createdUser.email},process.env.JWT_KEY,{expiresIn:'1h'});
  }catch(err){
     const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({userId:createdUser.id,email:createdUser.email,token});
};
const login=async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }
  
  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }
  let passwordIsValid;
  try{
      passwordIsValid=await bcrypt.compare(password, existingUser.password);
  }catch(err){
    return next(new HttpError('something went wrong while hashing your password',500));
  }
  if(!passwordIsValid){
    return next(new HttpError('Invalid credentials, could not log you in.',401));
  }
  let token;
  try{
    token=jwt.sign({userId:existingUser.id,email:existingUser.email},process.env.JWT_KEY,{expiresIn:'1h'});
  }catch(err){
     const error = new HttpError(
      'login failed, please try again.',
      500
    );
    return next(error);
  }

  res.json({userId:existingUser.id,email:existingUser.email,token});
};

module.exports={getUsers,signUp,login};
