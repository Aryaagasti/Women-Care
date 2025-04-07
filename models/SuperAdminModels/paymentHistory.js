const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    slNo: {
      type: Number,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy", // Reference to Delivery Boy
      required: true,
    },
    user: { // Renamed from "customer"
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      required: true,
      enum: [ "Online", "COD"], // Dropdown payment modes
    },
    status: {
      type: String,
      required: true,
      enum: ["Paid", "Not Paid"], // Payment status options
    },
    action: {
      type: String,
      enum: ["View"], // Actions like "eye button" for viewing details
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);
