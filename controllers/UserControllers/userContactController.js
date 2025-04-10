const ContactUs = require("../../models/UserModels/ContactUs");
 
const submitContactUs = async (req, res) => {
  try {
    const { email, phoneNumber, suggestions } = req.body;
 
    if (!email || !phoneNumber || !suggestions) {
      return res.status(400).json({ message: "All fields are required" });
    }
 
    const contactUs = new ContactUs({ email, phoneNumber, suggestions });
    await contactUs.save();
 
    res.status(200).json({ message: "Contact Us form submitted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
 
module.exports = {
  submitContactUs
};