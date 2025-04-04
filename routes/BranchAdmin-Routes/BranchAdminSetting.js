const express = require("express");
const { getSettings } = require("../../controllers/BranchAdmin-Controllers/BranchAdminSettingsController");
const router = express.Router();
 
 
 
router.get("/getSettings", getSettings);
 
module.exports = router;