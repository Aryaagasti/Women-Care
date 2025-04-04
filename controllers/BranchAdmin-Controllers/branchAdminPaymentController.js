const BranchAdminPaymentHistory = require("../../models/BranchAdminModels/BranchAdminPaymentHistory")
const DeliveryBoyModel =  require('../../models/SuperAdminModels/DeliveryBoy')


// Add Payment Record for Today's Payment
const payTodayPayment = async (req, res) => {
    try {
      const { slNo, date, branchAdmin, amountPaid, totalAmount, paymentMode, status, deliveryBoy, image } = req.body;
  
      // Ensure amountPaid does not exceed totalAmount
      if (amountPaid > totalAmount) {
        return res.status(400).json({ message: "Amount paid cannot exceed the total amount." });
      }
  
      // Calculate pending amount
      const pendingAmount = totalAmount - amountPaid;
  
      // Create a new payment record
      const newPayment = new BranchAdminPaymentHistory({
        slNo,
        date,
        branchAdmin,
        amountPaid,
        totalAmount,
        pendingAmount,
        paymentMode,
        status,
        deliveryBoy
      });
  
      await newPayment.save();
  
      res.status(201).json({
        message: "Today's payment submitted successfully.",
        payment: newPayment,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };
  
  // Get Payment History with Pagination, Sorting, and Filtering
  const getBranchAdminPaymentHistory = async (req, res) => {
    try {
      const { page = 1, limit = 10, sort = "slNo", order = "asc", date } = req.query;
  
      const filter = date ? { date: new Date(date) } : {}; // Filter by date if provided
  
      const paymentHistory = await BranchAdminPaymentHistory.find(filter)
        .populate("branchAdmin", "fullName contactNumber email") // Populate branch admin details
        .populate("deliveryBoy", "fullName email phoneNumber branch") // Populate delivery boy details
        .sort({ [sort]: order === "asc" ? 1 : -1 }) // Sort by slNo or other fields
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      const total = await BranchAdminPaymentHistory.countDocuments(filter); // Total filtered records
  
      res.status(200).json({
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        paymentHistory,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };
  
  // Get Dropdown for Delivery Boys
  const getDeliveryBoys = async (req, res) => {
    try {
      const deliveryBoys = await DeliveryBoyModel.find().select("fullName email phoneNumber branch image");
      res.status(200).json({ deliveryBoys });
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };
  
  module.exports = {
    payTodayPayment,
    getBranchAdminPaymentHistory,
    getDeliveryBoys,
  };