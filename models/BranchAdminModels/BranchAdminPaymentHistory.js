const mongoose = require("mongoose");

const branchAdminPaymentHistorySchema = new mongoose.Schema(
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
    branchAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BranchAdmin", // Reference to the Branch Admin
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    pendingAmount: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ["Cash", "Online"], // Dropdown payment modes
    },
    status: {
      type: String,
      required: true,
      enum: ["Paid", "Unpaid"], // Status options
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy", // Reference to the Delivery Boy
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BranchAdminPaymentHistory", branchAdminPaymentHistorySchema);
