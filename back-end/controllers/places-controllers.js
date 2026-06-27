const HttpError=require('../models/http-error');
const uuid=require("uuid");
const uuidv4 = uuid.v4;
const {validationResult}=require('express-validator');
const getCoordsForAddress = require('../util/geocodingNominatim');
const Place=require('../models/place');
const User=require('../models/user');
const { default: mongoose } = require('mongoose');
const fs=require('fs');
const path = require('path');


const getPlaceById=async(req,res,next)=>{
    const placeId=req.params.pid;
    let requiredPlace;
    try{
        requiredPlace=await Place.findById(placeId);
        }catch(err){
            return next(new HttpError("something went wrong couldn't find a place",500))
        }

    if(!requiredPlace) {
        return next(new HttpError("couldn't find a place for the provided ID",404));}
    res.json({requiredPlace:requiredPlace.toObject({getters:true})});
}

const getPlacesByUserId=async(req,res,next)=>{
    const userId=req.params.uid;
    let requiredPlaces;
    try{
        requiredPlaces=await Place.find({creator:userId}).populate('creator');
        }catch(err){
            return next(new HttpError("something went wrong couldn't find a place",500));
        }   
    if(!requiredPlaces.length === 0) {
        return next(new HttpError("couldn't find a place for the provided user ID",404));}
    res.json(requiredPlaces);
}

const createPlace=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError("invalid inputs passed, please check your data",422));
    }
    const {title,description,address}=req.body;
    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);
    } catch (err) {
        return next(err);
    }
    if (!coordinates) {
        return next(new HttpError("Could not get coordinates", 500));
}

    const createdPlace=new Place({
        title,description,address,location:coordinates,image:req.file.path,creator:req.userData.userId
    });
    let user;
    try{
        user=await User.findById(req.userData.userId);
    }
    catch(error){
        return next(new HttpError('creating a place failed,can not find a user with the provided creator Id ',500));
    }
    if (!user){
        return next(new HttpError('can not find a user with provided Id,404'));
    }
    try{
        const session0=await mongoose.startSession();
        session0.startTransaction();
        await createdPlace.save({session:session0});
        user.places.push(createdPlace);
        await user.save({session:session0});
        await session0.commitTransaction();


    }
    catch(error){
        
        return next(new HttpError('failed to creat a new place',500));
    }
    res.status(201).json(createdPlace);
}

const updatePlace=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError("invalid inputs passed, please check your data",422));
    }
    const placeId=req.params.pid;
    let placeToBeUpdated;
    try{
        placeToBeUpdated=await Place.findByIdAndUpdate(placeId,{title:req.body.title,description:req.body.description},{new:true});
        }catch(err){
            return next(new HttpError("something went wrong couldn't update a place",500));
        }
    if(placeToBeUpdated.creator.toString() !== req.userData.userId){
        return next(new HttpError("you are not allowed to upadate this place",401));
    }    
    
    if(!placeToBeUpdated){
        res.status(404).send("couldn't find place");
    }
   
    res.status(200).json({placeToBeUpdated:placeToBeUpdated.toObject({getters:true})});
}


const deletePlace=async(req,res,next)=>{
    const placeId=req.params.pid;
    let place;
    try{
        place=await Place.findById(placeId).populate('creator');}
        catch(err){
            return next(new HttpError("couldn't find a place",500));
        }
        if(!place){
        res.status(404).send("couldn't find place");
    }
    if(place.creator.id.toString() !== req.userData.userId){
        return next(new HttpError("you are not allowed to delete this place",401));
    }    
    let imagePath=path.join(path.dirname(__dirname),place.image);

    try{
        const session0=await mongoose.startSession();
        session0.startTransaction();
        await place.deleteOne({session:session0});
        place.creator.places.pull(place._id);
        await place.creator.save({session:session0});
        await session0.commitTransaction();


    }catch(err){
        
         return next(new HttpError("something went wrong couldn't delete a place",500));
    }
    fs.unlink(imagePath,(err)=>{console.log(err)});
    res.status(200).json('Place Deleted!!');
}

module.exports={getPlaceById,getPlacesByUserId,createPlace,updatePlace,deletePlace};

