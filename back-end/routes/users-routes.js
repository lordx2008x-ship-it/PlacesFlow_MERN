const express=require('express');
const router=express.Router();
const usersRouter=require('../controllers/users-controllers');
const {check}=require('express-validator');
const fileUpload=require('../middleware/file-upload');

router.get('/',usersRouter.getUsers);
router.post('/signup',fileUpload.single('image'),
    [check('name').not().isEmpty(),
     check('email').normalizeEmail().isEmail(),
     check('password').isLength({min:6})   
    ],
    usersRouter.signUp);
router.post('/login',usersRouter.login);



module.exports=router;