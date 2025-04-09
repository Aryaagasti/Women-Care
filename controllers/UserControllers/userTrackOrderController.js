const Order = require("../../models/UserModels/orderNow");
 
const statusEnum = [
  "Order Placed",
  "Confirmed",
  "In Process",
  "Order Confirmed",
  "Packed the Product",
  "Arrived in the Warehouse",
  "Ready by Courier Facility",
  "Out for Delivery",
  "Delivered",
];
 
const getTrackingOrderDetails = async (req, res) => {
  const { orderId } = req.params;
 
  try {
    const order = await Order.findById(orderId).populate("items.product", "productName price image quantity");
 
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
 
    const item = order.items[0];
    const productData = item.product || {};
    const tracking = [];
 
    // Always include "Order Placed" using createdAt
    const placedDateTime = formatDateTime(order.createdAt);
    tracking.push({
      status: "Order Placed",
      date: placedDateTime.date,
      time: placedDateTime.time
    });
 
    // ✅ Now include all other tracking statuses from order.tracking
    const addedStatuses = new Set();
    order.tracking.forEach(track => {
      if (track.status !== "Order Placed" && !addedStatuses.has(track.status)) {
        const timeStamp = formatDateTime(track.date);
        tracking.push({
          status: track.status,
          date: timeStamp.date,
          time: timeStamp.time
        });
        addedStatuses.add(track.status);
      }
    });
 
    return res.status(200).json({
      success: true,
      message: "Order details fetched",
      data: {
        orderId: order._id,
        product: {
          name:productData?.productName || "Not Available",
          quantity: ` ${item.quantity} Pads`,
          price: productData.price || "Not Available",
          image: productData.image || "Not Available"
        },
        tracking
      }
    });
 
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message
    });
  }
};
 
// 📌 Helper Function
const formatDateTime = (dateTime) => {
  const optionsDate = { day: '2-digit', month: 'short', year: 'numeric' };
  const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };
  return {
    date: dateTime.toLocaleDateString('en-GB', optionsDate),
    time: dateTime.toLocaleTimeString('en-US', optionsTime)
  };
};
 
 
 
 
  module.exports = {
    getTrackingOrderDetails
  }