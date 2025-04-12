const express = require("express");
const {
 getPaymentHistory, viewPaymentHistory,createPayment,getPaymentModes
} = require("../../controllers/branchAdmin-Controllers/branchAdminPaymentController");

const router = express.Router();

// Payment Routes
router.post("/create-payment", createPayment); // Create a new payment record
router.get("/get-payment-history", getPaymentHistory);
router.get("/view-payment-history/:deliveryBoyId", viewPaymentHistory);
router.get("/get-payment-modes", getPaymentModes);

module.exports = router;
