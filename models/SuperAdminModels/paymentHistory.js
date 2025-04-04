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
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch", // Reference to Branch model
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Approved", "Rejected","NA"], // Possible statuses
    },
    action: {
      type:String,
      enum:["Approved","Rejected"]
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentHistory", paymentHistorySchema);
