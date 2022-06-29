import express from 'express';
import { registerController, loginController, userController,refreshTokenController, productController } from '../controllers';
const router = express.Router();
import auth from '../middleware/auth.js';
import admin from '../middleware/admin';


//register a user
// router.post('/register', (req,res,next)=>{
//     //register a person logic 
//     //using mvc architecht >> make folder controller and in that make a file for register a user
// })

router.post('/register', registerController.register);
router.post('/login', loginController.login );
router.get('/me', auth,  userController.me );
router.post('/refresh',   refreshTokenController.refresh );
router.post('/logout', auth,  loginController.logout);

router.post('/products', [auth,admin], productController.store);
router.put('/products/:id',[auth, admin], productController.updateProduct);
router.delete('/products/:id',[auth, admin], productController.destroy); //delete product
router.get('/products', productController.index); //get all products
router.get('/products/:id', productController.show); //get single products



export default router;