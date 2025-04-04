const express = require("express");
const router = express.Router();
const { submitContactUs } = require("../../controllers/UserControllers/userContactController");
 
 
 
router.post("/contact-us", submitContactUs);
 
 
module.exports = router;