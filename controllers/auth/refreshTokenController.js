import Joi from "joi";
import { REFRESH_SECRET } from "../../config";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";

const refreshTokenController = {
    async refresh(req, res, next){
        //validate request
        const refreshSchema = Joi.object({
            token : Joi.string().required()   //refresh_token is what is got 
        });

        const { error } = refreshSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        //check in database if same then issue new access token
        let refreshToken;
        try{
            refreshToken  = await RefreshToken.findOne({token: req.body.token});
            if(!refreshToken){
                // return next(new Error('invalid refresh token'));
                return next(CustomErrorHandler.unauthorized('Invalid refresh token 1 '));
            }
            let user_id;
            try{
               const {_id } = JwtService.verify(req.body.token, REFRESH_SECRET );
                user_id = _id;
            }catch(err){
                return next(CustomErrorHandler.unauthorized('Invalid refresh token 2 '));
            }

            //check this user in db or not
            const user = await User.findOne({_id: user_id});
            if(!user){
                return next(CustomErrorHandler.unauthorized('No user found'));
            }

            //generate 2 type of token
            const accessToken = JwtService.sign({_id: user._id, role: user.role});
            refreshToken = JwtService.sign({_id: user._id, role: user.role}, '1y', REFRESH_SECRET);
            await RefreshToken.create({token: refreshToken});
            res.json({accessToken: accessToken, refreshToken: refreshToken});



        }catch(err){
            return next(new Error('something went wrong' + err.message));
        }

    }
}

export default refreshTokenController;