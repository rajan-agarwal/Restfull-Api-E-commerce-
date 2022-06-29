import { DEBUG_MODE } from "../config";
import { ValidationError } from 'joi';
import CustomErrorHandler from "../services/CustomErrorHandler";

const error_handler = (err, req, res, next) => {
    let status_code = 500;
    let data = {
        message: 'internal server error',
        originalError: 'not permitted to show'
    }
    if (DEBUG_MODE === 'true') {
        console.log(err);
        data.originalError = err.message;
    }

    if (err instanceof ValidationError) { //err is object of which class 
        status_code = 422;
        data = {
            message: err.message
        }
    }

    if(err instanceof CustomErrorHandler){
        // status and msg is property of custom error handler 
        status_code = err.status;
        data = {
            message: err.msg
        }
    }

    return res.status(status_code).json(data);
}

export default error_handler;  //to register in server.js so that server can know that it has to use it.