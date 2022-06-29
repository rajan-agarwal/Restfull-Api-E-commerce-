import Joi from 'joi';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';
import bcrypt from 'bcrypt';
import {User, RefreshToken} from '../../models';
import { REFRESH_SECRET } from '../../config';

const loginController = {
    async login(req, res, next) {
        /*
        1. validate request
        */
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });

        const { error } = loginSchema.validate(req.body);

        if (error) {
            return next(error);
        }
        /*
        2. existing email or not in database
        */

        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return next(CustomErrorHandler.wrongLoginInfo());
            }
            //user find
            //compare password
            const match = await bcrypt.compare(req.body.password, user.password);
            if (!match) {
                return next(CustomErrorHandler.wrongLoginInfo());
            }
            //matched password
            //send token to client
            const accessToken = JwtService.sign({_id: user._id, role: user.role});
            const refreshToken = JwtService.sign({_id: user._id, role: user.role}, '1y', REFRESH_SECRET);
            //database whitelist
            await RefreshToken.create({token: refreshToken});
            res.json({accessToken: accessToken, refreshToken: refreshToken});

        } catch (err) {
            return next(err);
        }
    },

    async logout(req,res, next){

        const logoutSchema = Joi.object({
            token: Joi.string().required()
        });


        const { error } = logoutSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        try{
            await RefreshToken.deleteOne({token: req.body.token});  //but for that we need to send the refresh token also
            //along with it send access token in header for handling auth middleware.
            res.json({status: 1});
        }catch(err){
            return next(new Error('Something went wrong in database'));
        }
    }
}


export default loginController;