const express = require("express");
const router = express.Router();
const { userValidateToken } = require("../../middlewares/userAuthMiddleware");
const { getTrackingOrderDetails } = require("../../controllers/UserControllers/userTrackOrderController");
 
router.get("/getTrackingOrderDetails/:orderId", userValidateToken, getTrackingOrderDetails);
 
module.exports = router;