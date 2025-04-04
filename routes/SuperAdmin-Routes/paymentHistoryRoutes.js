const express = require("express");
const {getPaymentHistory, addPaymentHistroy,updatePaymentAction} =  require("../../controllers/SuperAdmin-Controllers/paymentHistoryController")

const router = express.Router();

//payment routes
router.post("/add-payment-history", addPaymentHistroy);
router.get("/get-payment-history", getPaymentHistory);
router.put("/update-payment-action/:id", updatePaymentAction);


module.exports = router;