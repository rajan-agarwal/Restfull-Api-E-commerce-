class CustomErrorHandler extends Error{  //Error is inbuilt class of Javascript
    constructor(status, msg){
        super();
        this.status  = status;
        this.msg = msg;
    }

    //also creating a static method which called without classs
    static alreadyExist(message){
        return new CustomErrorHandler(409, message);
    }
    static wrongLoginInfo(message = 'wrong Credentials provided'){
        return new CustomErrorHandler(401, message);
    }

    static unauthorized(message = 'unauthorized'){
        return new CustomErrorHandler(401, message);
    }
    static notFoundUser(message = 'User not found'){
        return new CustomErrorHandler(404, message);
    }
    static serverError(message = 'Internal server error'){
        return new CustomErrorHandler(500, message);
    }
    static imagenotfound(message = 'image not found'){
        return new CustomErrorHandler(500, message);
    }
}

export default CustomErrorHandler;