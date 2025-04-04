const express = require("express");
const {
  payTodayPayment,
  getBranchAdminPaymentHistory,
  getDeliveryBoys,
} = require("../../controllers/BranchAdmin-Controllers/branchAdminPaymentController");

const router = express.Router();

// Payment Routes
router.post("/pay-today-payment", payTodayPayment); // Submit today's payment
router.get("/payment-history", getBranchAdminPaymentHistory); // Get payment history with pagination and sorting
router.get("/delivery-boys", getDeliveryBoys); // Get dropdown for delivery boys

module.exports = router;
