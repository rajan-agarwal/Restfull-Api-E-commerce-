import mongoose from 'mongoose';
const Schema = mongoose.Schema;


//Schema object is blue print
const userSchema = new Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: false,
        default: 'customer'
    }
}, {timestamps: true});

export default mongoose.model('User', userSchema, 'Users');

