const PaymentHistory = require("../../models/SuperAdminModels/DeliveryBoy");
const DeliveryBoy = require("../../models/SuperAdminModels/DeliveryBoy")
const User =  require("../../models/UserModels/User")

// Get Payment History with Pagination and Sorting
const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "slNo", order = "asc", paymentMode, date, status } = req.query;

    // Build filters dynamically
    const filter = {};
    if (paymentMode) filter.paymentMode = paymentMode; // Filter by payment mode
    if (date) filter.date = new Date(date); // Filter by date
    if (status) filter.status = status; // Filter by payment status

    // Fetch payment history with filters, pagination, and sorting
    const paymentHistory = await PaymentHistory.find(filter)
      .populate("deliveryBoy", "fullName") // Populate only fullName of delivery boy
      .populate("user", "fullName") // Populate only fullName of user
      .sort({ [sort]: order === "asc" ? 1 : -1 }) // Dynamic sorting
      .skip((page - 1) * limit) // Pagination
      .limit(parseInt(limit));

    // Get the total count of records matching the filters
    const total = await PaymentHistory.countDocuments(filter);

    if (!paymentHistory.length) {
      return res.status(404).json({
        message: "No payment history found matching the filters.",
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        paymentHistory: [],
      });
    }

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      paymentHistory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};
const viewPaymentHistory = async (req, res) => {
  try {
    const { deliveryBoyId } = req.params;

    // Fetch payment history for a specific delivery boy
    const paymentHistory = await PaymentHistory.find({ deliveryBoy: deliveryBoyId })
      .populate("deliveryBoy", "fullName") // Populate only fullName of delivery boy
      .populate("user", "fullName") // Populate only fullName of user
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    if (!paymentHistory.length) {
      return res.status(404).json({
        message: "No payment history found for the selected delivery boy.",
      });
    }

    res.status(200).json({
      deliveryBoy: paymentHistory[0].deliveryBoy,
      paymentHistory: paymentHistory.map((payment) => ({
        srNo: payment.slNo,
        productName: payment.productName,
        userName: payment.user.fullName,
        totalAmount: payment.totalAmount,
        status: payment.status === "Paid" ? "Yes (Given by Delivery Boy)" : "No (Not Given by Delivery Boy)",
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// Create Payment Record
const createPayment = async (req, res) => {
  try {
    const { date, deliveryBoy, user, productName, totalAmount, paymentMode, status } = req.body;

    // Dynamically generate unique slNo
    const lastPayment = await PaymentHistory.findOne().sort({ slNo: -1 });
    const slNo = lastPayment ? lastPayment.slNo + 1 : 1;

    // Validate required fields
    if (!date || !deliveryBoy || !user || !productName || !totalAmount || !paymentMode || !status) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate payment mode
    const allowedPaymentModes = ["Cash", "Online"];
    if (!allowedPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        message: `Invalid payment mode. Allowed values are: ${allowedPaymentModes.join(", ")}`,
      });
    }

    // Validate status
    const allowedStatuses = ["Paid", "Not Paid"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}`,
      });
    }

    // Validate deliveryBoy and user existence
    const existingDeliveryBoy = await DeliveryBoy.findById(deliveryBoy);
    if (!existingDeliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found." });
    }

    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create new payment record
    const newPayment = new PaymentHistory({
      slNo, // Automatically assigned unique slNo
      date,
      deliveryBoy,
      user,
      productName,
      totalAmount,
      paymentMode,
      status,
    });

    // Save the record to the database
    await newPayment.save();

    res.status(201).json({
      message: "Payment record created successfully.",
      payment: newPayment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// Get Dropdown for Payment Modes
const getPaymentModes = async (req, res) => {
  try {
    // Fetch allowed payment modes from the schema
    const paymentModes = PaymentHistory.schema.path("paymentMode").enumValues; // Extract `enum` from schema
    
    // Return the payment modes
    res.status(200).json({ paymentModes });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = { getPaymentHistory, viewPaymentHistory, createPayment,getPaymentModes};