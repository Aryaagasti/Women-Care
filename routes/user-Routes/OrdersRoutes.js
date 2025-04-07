const express = require("express");
const router = express.Router();
const { userValidateToken } = require("../../middlewares/userAuthMiddleware");
const { getOrderById, confirmOrder, deliveredOrder, getUserOrders, getOrderDetails, cancelOrder, ongoingOrder } = require("../../controllers/UserControllers/orderNowController");



router.get("/orders", userValidateToken, getUserOrders);
router.get("/orders/:orderId", userValidateToken, getOrderDetails);
router.get("/details/:orderId", userValidateToken, getOrderById);
router.put("/confirm/:orderId", userValidateToken, confirmOrder);
router.put("/delivered/:orderId", userValidateToken, deliveredOrder);
router.put("/ongoing/:orderId", userValidateToken, ongoingOrder);
router.put("/cancel/:orderId", userValidateToken, cancelOrder);




module.exports = router;