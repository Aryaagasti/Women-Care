const express = require("express");
const router = express.Router();
const { userValidateToken } = require("../../middlewares/userAuthMiddleware");
const { addToCart, removeFromCart, BuyOrderFromCart, incrementCartItem, decrementCartItem, cancelOrder, getOrderById, confirmOrder, getUserOrders,getOrderDetails } = require("../../controllers/UserControllers/userCartController");
 
 
 
router.post("/addtocart/:productId",userValidateToken,addToCart);
router.put("/increment/:productId", userValidateToken,incrementCartItem);
router.put("/decrement/:productId",userValidateToken, decrementCartItem);
router.post('/buyNow', userValidateToken, BuyOrderFromCart);
router.delete("/remove/:productId", userValidateToken, removeFromCart);

 
 
module.exports = router;