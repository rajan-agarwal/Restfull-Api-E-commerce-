import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";

const auth = async (req,res,next) =>{
    // in get request of who am i, we send a authorization header {Authorization: Bearer access_token_value} 
    let authHeader = req.headers.authorization;
    if(!authHeader){
        //token is not sent with request so no need to proceed request
        return next(CustomErrorHandler.unauthorized());
    }
    //token is sent with request
    //value[authorization] =  Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmFmMzliMTM5ODQ1MDVkNTU4MGUyN2MiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE2NTU2NjEzNDIsI
    const token =  authHeader.split(' ')[1];
    //check if token is changed or not
    try{
        const {_id, role} = await JwtService.verify(token);
        req.user = {}; //user is property attached by me on req.
        req.user._id  = _id;
        req.user.role = role;
        next();
    }catch(err){
        return next(CustomErrorHandler.unauthorized());
    }
}
export default auth;