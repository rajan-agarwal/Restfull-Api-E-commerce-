import Joi from 'joi';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import {RefreshToken, User} from '../../models';
import bcrypt from 'bcrypt';
import JwtService from '../../services/JwtService';
import {REFRESH_SECRET} from '../../config';

//object
const  registerPersonController = {
        /* checklist
        1. validate request
        2. check is user is already in database
        3. import User model
        4. store user info in User model for database
        5. generate jwt access token
        6. send jwt token as respose
        */
        async register(req, res, next) {

                /* validate request ...........................................................................*/
                const registerSchema = Joi.object({
                        //method chaining
                        name: Joi.string().min(3).max(30).required(),
                        email: Joi.string().email().required(),
                        password: Joi.string().required(),
                        repeat_password: Joi.ref('password'),
                        role: Joi.string().required(),
                })

                const { error } = registerSchema.validate(req.body);  // req.body is disabled by default so register
                //app.use(express.json()) to use it in server.sj

                if (error) {
                        // res.json({}) not good for complex app
                        return next(error); //our error handling middleware will catch this error
                }

                // res.json({msg: "Hellow from express"});  
                // if validation passed
                //check if user is in database already.............................................................
                try {
                        const exist = await User.exists({ email: req.body.email });
                        if (exist) {
                                return next(CustomErrorHandler.alreadyExist("This email is already taken"));  //here we need custom error handler in services folder
                        }
                } catch (err) {
                        return next(err);  //this is differnt error so default error handler will return;
                }
                //store user........................................................................................
                //hash password
                const hashedPwd = await bcrypt.hash(req.body.password, 10);
                //prepare the model to store 
                const user = new User ({
                        name: req.body.name,
                        email: req.body.email,
                        password: hashedPwd,
                        role: req.body.role
                });

                //save in db
                let accessToken;
                let refreshToken;
                try{
                        const saveduserinfo = await user.save();
                        //token 
                        //created a token sign service folder.............................................................
                        accessToken =  JwtService.sign({_id: saveduserinfo._id, role: saveduserinfo.role});
                        refreshToken = JwtService.sign({_id: saveduserinfo._id, role: saveduserinfo.role}, '1y', REFRESH_SECRET);
                        //database whitelist
                        await RefreshToken.create({token: refreshToken});

                }catch(err){
                        return next(err);
                }
                //..send response................................................................................
                return res.json({accessToken: accessToken, refreshToken: refreshToken});


        }
}

export default registerPersonController;