import { Product } from '../../models';
import multer from 'multer';
import path from 'path';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import Joi from 'joi';
import fs from 'fs';

//define path and filename of file storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/');
    },

    filename: function (req, file, callback) {
        // ex : 1243523442-2424244234.png 
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        console.log(uniqueName);
        callback(null, uniqueName);
    }
});


const handleMultipartData = multer({
    storage: storage,
    limits: { fileSize: 100000 * 5 }
}).single(('image'));

const productController = {
    store(req, res, next) {
        //multipart form data to be received from client not a json data because of image.
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }
            // console.log(req.file);
            if (!req.file) {
                return next(CustomErrorHandler.imagenotfound());
            }
            let filePath = req.file.path //due to multer
            filePath = filePath.substring(0, 7) + '/' + filePath.substring(8);

            //validate request
            const productSchema = Joi.object({
                name: Joi.string().required(),
                price: Joi.number().required(),
                info: Joi.string().required()
            });

            const { error } = productSchema.validate(req.body);

            if (error) {
                //delete uploaded image
                fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if (err)
                        return next(CustomErrorHandler.serverError(err.message));
                });  //app root is global variable defined in server.js
                return next(error);
            }

            const { name, price, info } = req.body;
            let document = new Product({
                name: name,
                price: price,
                info: info,
                image: filePath
            });
            try {
                const documentsaved = document.save();
            } catch (err) {
                return next(err);
            }

            res.status(201).json(document);
        });
    },


    async updateProduct(req, res, next) {
        handleMultipartData(req, res, async (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError(err.message));
            }
            let filePath;
            if (req.file) {
                filePath = req.file.path
                filePath = filePath.substring(0, 7) + '/' + filePath.substring(8);

            }
            const productSchema = Joi.object({
                name: Joi.string().min(3).max(30),
                price: Joi.number().min(1),
                info: Joi.string(),
            });

            const { error } = productSchema.validate(req.body);

            if (error) {
                if (req.file) {
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        if (err)
                            return next(CustomErrorHandler.serverError(err.message));
                    });
                }
                return next(error);
            }

            const { name, price, info } = req.body;
            console.log(name, price, info, filePath);
            let document;
            try {
                document = await Product.findOneAndUpdate({ _id: req.params.id }, {
                    name,
                    price,
                    info,
                    image: filePath
                    //if things are undefined in above variables then they do not get updated automatically
                }, { new: true });  //updated data is returned

                console.log(document);
            } catch (err) {
                return next(err);
            }

            res.status(201).json(document);
        });
    },

    async destroy(req, res, next) {
        const document = await Product.findOneAndRemove({ _id: req.params.id });
        if (!document) {
            return next(new Error('Nothing to delete')); ///this changes orginal error of error_handler middleware
        }
        //if doc present then delete the image also
        let imagePath = document.image;
        // image get is http://localhost:5000/uploads/1655741800325-990251370.png  due to getters in product model
        // required is  ${approot}/uploads/1655741800325-990251370.png
        //so
        imagePath = document._doc.image;  //_doc will give us string without getter.
        console.log(imagePath);
        fs.unlink(appRoot + '/' + imagePath, (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError());
            }
        })
        res.json(document);
    },

    async index(req, res, next) {
        let documents;

        try {
            documents = await Product.find().select("-updatedAt -__v").sort({ _id: -1 });  //all products passed as in array but not efficient so use pagination if lot of products.
            //use libray of paginations moongose-pagination.
            //sorted in desending order with respect to id
            //you should give complete path of image with server domain 
            //first way is to loop over documents add add that domain to each image url
            //second way is to use getters in model of products. (yes)


        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async show(req, res, next) {
        let document;
        try {
            document = await Product.findOne({ _id: req.params.id }).select('-updatedAt -__v');
            return res.json(document);
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
    }
}

export default productController;