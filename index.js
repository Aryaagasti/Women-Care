const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");



//Importing All Adim Related Routes
const adminRoute = require("./routes/SuperAdmin-Routes/Super-AdminRoutes"); 
const branchRoute = require("./routes/SuperAdmin-Routes/branchRoutes");
const deliveryBoyRoute = require("./routes/SuperAdmin-Routes/deliveryRoutes");
const bannerRoute = require("./routes/SuperAdmin-Routes/bannerRoutes");
const dashboardRoutes = require("./routes/SuperAdmin-Routes/dashboardRoutes");
const productRoute = require("./routes/SuperAdmin-Routes/productRoutes");
const testimonialRoute = require("./routes/SuperAdmin-Routes/testimonialRoutes");
const settingsRoute = require("./routes/SuperAdmin-Routes/SettingRoutes");
const customerRoute = require("./routes/SuperAdmin-Routes/customerRoutes");

const PaymentRoute =  require("./routes/SuperAdmin-Routes/paymentHistoryRoutes")






//Importing All Branch Admin Related Routes
const branchAdminRoute = require("./routes/BranchAdmin-Routes/branchAdminRoutes");
const branchAdminProductRoute = require("./routes/BranchAdmin-Routes/branchAdminProductRoutes");
const branchAdminDeliveryBoyRoute = require("./routes/BranchAdmin-Routes/branch-adminDeliveryBoyRoutes");
const branchAdminPaymentRoute = require("./routes/BranchAdmin-Routes/branchAdminPaymentRoutes");
const branchSettingsRoutes = require("./routes/BranchAdmin-Routes/BranchAdminSetting");
const branchAdminCustomerRoutes = require("./routes/BranchAdmin-Routes/branchAdminCustomerRoutes");
const branchDetailsRoutes = require("./routes/BranchAdmin-Routes/branchDetailsRoutes");
const branchOrderRoutes = require("./routes/BranchAdmin-Routes/branchAdminOrderRoutes");

//Importing All User Related Routes
const userRoute = require("./routes/user-Routes/useRoutes");
const userReviewRoute =  require("./routes/user-Routes/userReviewRoutes")
const userProductRoutes = require("./routes/user-Routes/userProductRoutes");
const cartRoutes = require("./routes/user-Routes/userCartRoutes");
const orderRoutes = require("./routes/user-Routes/OrdersRoutes");
const contactUsRoutes = require("./routes/user-Routes/userContactUsRoutes");
const userSettingsRoutes = require("./routes/user-Routes/userSettingsRoutes");
const trackingOrderRoutes =  require("./routes/user-Routes/userTrackOrderRoutes")

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();


//Super Admin  Routes
app.use("/api/superAdmin",adminRoute);
app.use("/api/branch", branchRoute);
app.use("/api/deliveryBoy", deliveryBoyRoute);
app.use("/api/banner", bannerRoute);
app.use("/api/products", productRoute);
app.use("/api/testimonial", testimonialRoute);
app.use("/api/customer", customerRoute);
app.use("/api/superAdminPayment",PaymentRoute);
app.use("/api/settings",settingsRoute);
app.use("/api/dashboard",dashboardRoutes);

//Branch Admin Routes
app.use("/api/branchAdmin", branchAdminRoute);
app.use("/api/branchAdminProduct", branchAdminProductRoute);
app.use("/api/branchAdminDeliveryBoy", branchAdminDeliveryBoyRoute);
app.use("/api/branchAdminPayment", branchAdminPaymentRoute);
app.use("/api/branchSettings", branchSettingsRoutes);
app.use("/api/branchAdminCustomer", branchAdminCustomerRoutes);
app.use("/api/branchAdmin", branchDetailsRoutes);
app.use("/api/branchOrder", branchOrderRoutes);

//User Routes
app.use("/api/user", userRoute);
app.use("/api/userReview", userReviewRoute);
app.use("/api/order", orderRoutes);
app.use("/api/userProduct", userProductRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contactUs", contactUsRoutes);
app.use("/api/userSettings", userSettingsRoutes);
app.use("/api/trackingOrder",trackingOrderRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
