const express=require('express');
const bodyParser=require('body-parser');
const fs=require('fs');
const placesRoutes=require('./routes/places-routes');
const usersRoutes=require('./routes/users-routes');
const HttpError=require('./models/http-error');
const mongoose=require('mongoose');
const path=require('path')

const app=express();
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    /*if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }*/
    next();
});

app.use('/uploads/images', express.static('uploads/images'))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'..','front-end','react-frontend-01-starting-setup','build')));
app.use('/api/places',placesRoutes);
app.use('/api/users',usersRoutes);
app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname,'..','front-end','react-frontend-01-starting-setup','build','index.html')
  );
});
/*app.use((req,res,next)=>{
    let error=new HttpError("couldn't find this route",404);
    next(error);
})*/

app.use((error,req,res,next)=>{
    if(req.file){
        fs.unlink(req.file.path,(err)=>{console.log(err)});
    }
    if(res.headersSent){
        return next(error);
    }
    res.status(error.code||500).json({message:error.message || "unknow error occured"});
})
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u1kfijq.mongodb.net/${process.env.DB_NAME}`)
.then(()=>app.listen(5000)).catch(err=>console.log(err));