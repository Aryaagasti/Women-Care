const express = require('express');
const router = express.Router();

const { getBranchDetails} = require("../../controllers/BranchAdmin-Controllers/branchDetailsController");


router.get("/branch/:branchId", getBranchDetails);

module.exports = router;