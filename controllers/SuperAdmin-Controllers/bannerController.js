const Banner = require("../../models/SuperAdminModels/banner");
const { cloudinary } = require("../../config/cloudinary");

// Add a new banner
const addBanner = async (req, res) => { 
    try {
        const { category, status } = req.body;

        // Validate category
        if (!category || !["Offer Banner", "Discount"].includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing category. Valid options: 'Offer Banner', 'Discount'.",
            });
        }

        // Validate status
        if (!status || !["Published", "Not Published"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing status. Valid options: 'Published', 'Not Published'.",
            });
        }

        // Validate image files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one image is required.",
            });
        }

        // Check image limit
        if (req.files.length > 5) {
            return res.status(400).json({
                success: false,
                message: "You can upload a maximum of 5 images.",
            });
        }

        // Store image paths
        const images = req.files.map((file) => file.path);

        // Create a new banner
        const newBanner = new Banner({ category, images, status });
        await newBanner.save();

        res.status(201).json({
            success: true,
            message: "Banner added successfully.",
            data: newBanner,
        });
    } catch (error) {
        console.error("Error adding banner:", error);
        res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

// Get all banners with pagination and filtering
const getBanners = async (req, res) => {
    try {
        let query = req.query.query || "";
        let limit = parseInt(req.query.limit) || 4;
        let page = parseInt(req.query.page) || 1;
        let sortOrder = req.query.sort === "asc" ? 1 : -1;

        let filter = {};
        if (query) {
            filter.category = { $regex: query, $options: "i" };
        }

        const totalBanners = await Banner.countDocuments(filter);
        const totalPages = Math.ceil(totalBanners / limit);

        const banners = await Banner.find(filter)
            .sort({ createdAt: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            totalBanners,
            totalPages,
            currentPage: page,
            banners,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a banner with Cloudinary image upload
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, status } = req.body;
        let updateData = {};

        if (category) updateData.category = category;
        if (status) updateData.status = status;

        const existingBanner = await Banner.findById(id);
        if (!existingBanner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        // Remove old images from Cloudinary
        if (existingBanner.images && existingBanner.images.length > 0) {
            for (let imageUrl of existingBanner.images) {
                const publicId = imageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`Women_Care_Banners/${publicId}`);
            }
        }

        updateData.images = [];
        
        // Upload new images to Cloudinary
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, { folder: "Women_Care_Banners" });
                updateData.images.push(result.secure_url);
            }
        }

        const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, banner: updatedBanner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a banner
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBanner = await Banner.findByIdAndDelete(id);

        if (!deletedBanner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        res.status(200).json({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get dropdown options for category
const getDropdownCategoryOptions = async (req, res) => {
    try {
        const categories = ["Offer Banner", "Discount"];
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
};

// Get dropdown options for status
const getDropdownStatusOptions = async (req, res) => {
    try {
        const statuses = ["Published", "Not Published"];
        res.json({ statuses });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
};

module.exports = {
    addBanner,
    getBanners,
    updateBanner,
    deleteBanner,
    getDropdownCategoryOptions,
    getDropdownStatusOptions,
};
