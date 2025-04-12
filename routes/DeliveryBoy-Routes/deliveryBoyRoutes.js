const express = require("express");
const {LoginDeliveryBoy, getDeliveryBoyProfile, updateProfile} =  require("../../controllers/deliveryBoy-Controllers/deliveryBoyAuthController")
const deliveryBoyAuthMiddleware =  require("../../middlewares/deliveryBoyAuthMiddleware")
const { upload } = require("../../config/cloudinary");
const router = express.Router();

//login route
router.post("/login", LoginDeliveryBoy);
//get profile route
router.get("/getProfile", deliveryBoyAuthMiddleware, getDeliveryBoyProfile);
//update profile route
router.put("/updateProfile", deliveryBoyAuthMiddleware, upload.fields([
    { name: "profileImage", maxCount: 1 },
]), updateProfile);

module.exports = router;
