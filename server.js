import express from 'express';  //due to esm package
import mongoose from 'mongoose';
import { APP_PORT, DB_URL } from './config';
import error_handler from './middleware/error_handler';
const app = express();
app.use(express.json()); //before routes
import cors from 'cors';


import path from 'path';
global.appRoot = path.resolve(__dirname);  //global variable used in multer in storing product
app.use(express.urlencoded({extended:false})); //for multipart data
app.use(cors());


mongoose.connect(DB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});




import router from './routes/index.js';
app.use('/api', router);


app.use('/uploads', express.static('uploads'));

let port = 5000 || APP_PORT

app.use(error_handler);  //at the end
app.listen(port, ()=>{
    console.log(`listeing on port ${APP_PORT}`);
});