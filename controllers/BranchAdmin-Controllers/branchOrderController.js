const Order = require("../../models/UserModels/orderNow");
const branchModel = require("../../models/SuperAdminModels/branch");

//✅ getAllBranchOrders
const getAllBranchOrders = async (req, res) => {
  try {
    const {
      query = "",
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const sortOrderValue = sortOrder === "desc" ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrderValue };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch filtered & paginated orders first
    let orders = await Order.find()
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "fullName phoneNumber email address")
      .populate("items.product", "productName image");

    const allBranches = await branchModel.find();

    // Enrich with branch info
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const userAddress = order.user?.address || "";
        const matchedBranch = allBranches.find((branch) => {
          const servicePin = branch.servicePinCode?.toString();
          return (
            userAddress.includes(servicePin) ||
            branch.fullAddress.includes(userAddress)
          );
        });

        return {
          ...order.toObject(),
          branchInfo: matchedBranch || null,
        };
      })
    );

    // Filter using search query (if any)
    let filteredOrders = enrichedOrders;
    if (query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      filteredOrders = enrichedOrders.filter((order) => {
        return (
          searchRegex.test(order.user?.fullName) ||
          searchRegex.test(order.user?.email) ||
          searchRegex.test(order.user?.phoneNumber?.toString()) ||
          searchRegex.test(order.branchInfo?.branchName || "") ||
          searchRegex.test(order.branchInfo?.phoneNumber?.toString() || "") ||
          order.items?.some((item) =>
            searchRegex.test(item.product?.productName || "")
          )
        );
      });
    }

    const totalOrders = filteredOrders.length;
    const totalPages = Math.ceil(totalOrders / parseInt(limit));
    const hasPrevious = parseInt(page) > 1;
    const hasNext = parseInt(page) < totalPages;

    // Final slice for paginated response after filtering
    const paginatedOrders = filteredOrders.slice(0, parseInt(limit));

    const simplifiedOrders = paginatedOrders.map((order) => ({
      orderId: order._id,
      customerInfo: {
        name: order.user?.fullName,
        phone: order.user?.phoneNumber,
        email: order.user?.email,
        address: order.user?.address,
      },
      products: order.items?.map((item) => ({
        name: item.product?.productName,
        image: item.product?.image?.[0] || null,
      })),
      orderStatus: order.status || order.orderStatus,
      branchName: order.branchInfo?.branchName || null,
    }));

    res.status(200).json({
      success: true,
      message: "All Orders fetched successfully",
      totalOrders,
      totalPages,
      currentPage: parseInt(page),
      hasPrevious,
      hasNext,
      // count: simplifiedOrders.length,
      data: simplifiedOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};


//✅ getOrderBranchDetails
const getOrderBranchDetails = async (req, res) => {
  try {
    const { OrderId } = req.params;

    if (!OrderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(OrderId)
      .populate("user", "fullName phoneNumber email address")
      .populate(
        "items.product",
        "image productCode brand productSubType productDescription size price"
      )
      .populate("branchInfo");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let matchedBranch = null;

    if (order.branchInfo) {
      matchedBranch = {
        name: order.branchInfo.branchName,
        phone: order.branchInfo.phoneNumber,
        fullAddress: order.branchInfo.fullAddress,
      };
    } else {
      const allBranches = await branchModel.find();
      const userAddress = order.user?.address?.toLowerCase() || "";

      const found = allBranches.find((branch) => {
        const servicePin = branch.servicePinCode?.toString() || "";
        const fullBranchAddress = branch.fullAddress?.toLowerCase() || "";

        return (
          userAddress.includes(servicePin) ||
          fullBranchAddress.includes(userAddress) ||
          userAddress.includes(fullBranchAddress)
        );
      });

      if (found) {
        matchedBranch = {
          name: found.branchName,
          phone: found.phoneNumber,
          fullAddress: found.fullAddress,
        };
      }
    }

    const firstItem = order.items?.[0];

    const simplifiedOrder = {
      image: firstItem?.product?.image[0],
      OrderID: order.orderId,

      customerInfo: {
        name: order.user?.fullName,
        phone: order.user?.phoneNumber,
        email: order.user?.email,
        address: order.user?.address,
      },

      branchInfo: matchedBranch,

      ProductCode: firstItem?.product?.productCode,
      ProductBrand: firstItem?.product?.brand,
      ProductSubType: firstItem?.product?.productSubType,
      ProductDescription: firstItem?.product?.productDescription,
      Size: firstItem?.product?.size,
      OrderQuantity: firstItem?.quantity,
      Price: firstItem?.product?.price,
      OrderStatus: order.status,
      PaymentMode: order.paymentMethod,
      DeliveryType: order.emergencyDelivery ? "Emergency (₹20 Extra)" : "Normal Delivery",
      GrandTotal: order.totalAmount,

      ...(order.status === "Cancelled" && {
        reason: order.cancelReason || order.otherReason || "N/A",
      }),
    };

    res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: simplifiedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};


//✅ getOrderStatus
const getOrderStatus = async (req, res) => {
  try {
      const statuses = [ "In Process",
        "Order Placed",
        "Confirmed",
        "Packed the Product",
        "Arrived in the Warehouse",
        "Ready by Courier Facility",
        "Out for Delivery",
        "Delivered",
        "Cancelled"];
      res.status(200).json({
          success: true,
          statuses
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "Error fetching statuses",
          error: error.message
      });
  }
};
 

module.exports = {
  getAllBranchOrders,
  getOrderBranchDetails,
  getOrderStatus
};
