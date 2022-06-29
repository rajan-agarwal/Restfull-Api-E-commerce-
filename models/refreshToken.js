import mongoose from 'mongoose';
const Schema = mongoose.Schema;


//Schema object is blue print
const refreshTokenSchema = new Schema({
   token:{
    type: String,
    unique: true
   }
});

export default mongoose.model('RefreshToken', refreshTokenSchema, 'RefreshTokens');

