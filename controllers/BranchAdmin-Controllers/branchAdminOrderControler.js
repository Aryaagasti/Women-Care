const Order = require("../../models/UserModels/orderNow");
const branchModel = require("../../models/SuperAdminModels/branch");

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
        const orders = await Order.find()
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate("user", "fullName phoneNumber email address")
            .populate("items.product", "productName image");

        const allBranches = await branchModel.find();

        // Enrich with branch info
        const enrichedOrders = orders.map((order) => {
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
        });

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

const getOrderStatus = async (req, res) => {
    try {
        const statuses = [
            "In Process",
            "Order Placed",
            "Confirmed",
            "Packed the Product",
            "Arrived in the Warehouse",
            "Ready by Courier Facility",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
        ];
        res.status(200).json({
            success: true,
            statuses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching statuses",
            error: error.message,
        });
    }
};

module.exports = { getAllBranchOrders, getOrderStatus };
