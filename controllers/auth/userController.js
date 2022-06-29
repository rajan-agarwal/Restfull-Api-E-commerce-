import CustomErrorHandler from '../../services/CustomErrorHandler';
import {User} from '../../models';

const userController = {
    async me(req, res, next) {

        try {
            const user = await User.findOne({ _id: req.user._id }).select('-password -updatedAt -__v' );  //to get this we will use miidleware and since
            //this is protected resource so we need to pass accesstoken in middleware also.
            if(!user){
                return next(CustomErrorHandler.notFoundUser());
            }
            res.json(user);
        }
        catch(err){
            return next(err);
        }
    }
}


export default userController;