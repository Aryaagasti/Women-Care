const express = require("express");
const router = express.Router();

// Import the controller (corrected the file name/path)
const { getAllBranchOrders, getOrderStatus } = require("../../controllers/BranchAdmin-Controllers/branchAdminOrderControler");

// Define routes
router.get("/all-branch-orders", getAllBranchOrders);
router.get("/order-status", getOrderStatus);

module.exports = router;
