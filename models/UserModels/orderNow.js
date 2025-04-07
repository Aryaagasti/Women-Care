const mongoose = require("mongoose");
 
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  deliveryAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "Online"],
    required: true
  },
  emergencyDelivery: {
    type: Boolean,
    default: false
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryCharges: {
    type: Number,
    default: 0
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered","Ongoing" ,"Cancelled", "Confirmed"],
    default: "Pending"
  },
  cancelReason: {
    type: String,
    enum: [
        "I want to change the Product",
        "Not available on the delivery time",
        "Price High",
        "I ordered wrong Product",
        "Other"
    ],
    default: null
  },
  otherReason: {
    type: String,
    default: null,
    validate: {
      validator: function (value) {
        return this.cancelReason !== "Other" || (this.cancelReason === "Other" && value?.trim().length > 0);
      },
      message: "Please provide a reason if 'Other' is selected"
    }
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
});
 
const Order = mongoose.model("OrderCart", orderSchema);
 
module.exports = Order;