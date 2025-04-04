const PaymentHistory = require("../../models/SuperAdminModels/paymentHistory");
const Branch = require("../../models/SuperAdminModels/branch");

// Get Payment History with Pagination and Sorting
const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "slNo", order = "asc" } = req.query;

    // Fetch payment history with pagination and sorting
    const paymentHistory = await PaymentHistory.find()
      .populate("branch", "branchName fullAddress") // Populate branch details
      .sort({ [sort]: order === "asc" ? 1 : -1 }) // Sort based on slNo
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await PaymentHistory.countDocuments(); // Total number of records

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

// Add Payment History
const addPaymentHistroy = async (req, res) => {
  try {
    const { slNo, date, branch, amountPaid, status } = req.body;

    // Validate branch existence
    const existingBranch = await Branch.findById(branch);
    if (!existingBranch) {
      return res.status(404).json({ message: "Branch not found." });
    }

    // Create new payment record
    const newPayment = new PaymentHistory({
      slNo,
      date,
      branch,
      amountPaid,
      status,
    });

    await newPayment.save();

    res.status(201).json({
      message: "Payment record created successfully.",
      payment: newPayment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const updatePaymentAction =  async (req,res)=> {
  try {
    const {id} =  req.params;
    const {action} =  req.body;

    //validate action
    if(!["Approved","Rejected"].includes(action)){
      return res.status(400).json({message: "Invalid action. Please provide either 'Approved' or 'Rejected'."})

    }
    const payment =  await PaymentHistory.findById(id)
    if(!payment){
      return res.status(404).json({ message: "Payment record not found." });

    }
    //// Ensure status is "NA" before updating action
    if(payment.status !== "NA"){
      return res.status(400).json({ message: "Action can only be updated for status 'NA'." });
    }

    //update action and status
    payment.action = action;
    payment.status = action;
    await payment.save();
    res.status(200).json({message:"Payment Action Updated Successfully"});
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
}

module.exports = { getPaymentHistory,addPaymentHistroy ,updatePaymentAction};