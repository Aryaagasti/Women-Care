const express = require('express');
const router = express.Router();

const branchAdminDetails = require('../../controllers/branchAdmin-Controllers/branchAdminDetailsController')

//✅ Branch Details Routes
router.get("/branch/:branchId", branchAdminDetails.getBranchDetails);

module.exports = router;