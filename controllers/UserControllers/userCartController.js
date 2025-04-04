const Cart = require("../../models/UserModels/CartModel")
const Order = require("../../models/UserModels/BuyNow");
const Product = require('../../models/SuperAdminModels/Product');
 
//Add Item  To Cart
const addToCart = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;
        const userId = req.user.id;
 
        const parsedQuantity = Number(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }
 
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
 
        let cart = await Cart.findOne({ userId });
 
        if (!cart) {
            cart = new Cart({ userId, items: [], totalAmount: 0 });
        }
 
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
 
        if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity += parsedQuantity;
        } else {
            cart.items.push({ productId, quantity: parsedQuantity, price: product.price });
        }
 
        cart.totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
 
        await cart.save();
    return res.status(200).json({ success: true, message: "Item added to cart", cart });
 
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
 
// Increment Quantity
const incrementCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;
 
        let cart = await Cart.findOne({ userId });
 
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
 
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
 
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }
 
        cart.totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
 
        await cart.save();
       return  res.status(200).json({ success: true, message: "Quantity increased", cart });
 
    } catch (error) {
       return  res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
 
// Decrement Quantity
const decrementCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;
 
        let cart = await Cart.findOne({ userId });
 
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
 
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
 
        if (existingItemIndex !== -1) {
            if (cart.items[existingItemIndex].quantity > 1) {
                cart.items[existingItemIndex].quantity -= 1;
            } else {
                cart.items.splice(existingItemIndex, 1);
            }
        } else {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }
 
        cart.totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
 
        await cart.save();
       return  res.status(200).json({ success: true, message: "Quantity decreased", cart });
 
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};  
 
 
//Remove Item From Cart
  const removeFromCart = async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params; 
  
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }
  
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({ success: false, message: "Item not found in cart" });
      }
  
      cart.items.splice(itemIndex, 1); 
  
      cart.totalAmount = cart.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
  
      await cart.save();
      return res.status(200).json({ success: true, message: "Item removed from cart", cart });
  
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  };
 
  // Craete Order From Cart
  const BuyOrderFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
 
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty. Add products first." });
        }
 
        let totalAmount = 0;
        let orderItems = [];
        let insufficientStockProducts = [];
        
        const emergencyDelivery = req.body.emergencyDelivery === "true";  
 
        for (const item of cart.items) {
            const product = item.productId;
            if (!product) {
                return res.status(400).json({ message: "One of the products in your cart is missing." });
            }
 
            if (product.stock < item.quantity) {
                insufficientStockProducts.push(product.name);
                continue;
            }
 
            totalAmount += item.quantity * item.price;
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: item.price
            });
 
            product.stock -= item.quantity;
            await product.save();
        }
 
        if (insufficientStockProducts.length > 0) {
            return res.status(400).json({
                message: `Not enough stock for: ${insufficientStockProducts.join(", ")}`,
            });
        }
 
        if (emergencyDelivery) {
            totalAmount += 20;
        }
 
        const newOrder = new Order({
            user: userId,
            deliveryAddress: req.body.deliveryAddress,
            paymentMethod: req.body.paymentMethod,
            totalAmount: totalAmount,
            items: orderItems,
            emergencyDelivery: emergencyDelivery 
        });
 
        await newOrder.save();
        await Cart.findOneAndDelete({ userId });
 
        return res.status(201).json({
            message: "Order placed successfully",
            order: newOrder,
            emergencyDelivery: emergencyDelivery ? "₹20 Emergency Delivery Charges applied" : "No Emergency Delivery Charges"
        });
 
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
 
  //Get order By Id
  const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id; 
 
        const order = await Order.findOne({ _id: orderId, user: userId })
            .populate("items.product", "name price imageUrl") 
            .populate("user", "name email");
 
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }
 
        return res.status(200).json({
            message: "Order details retrieved successfully",
            order
        });
 
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
  

  module.exports = {
    addToCart,
    incrementCartItem,
    decrementCartItem,
    removeFromCart,
    BuyOrderFromCart,
    getOrderById
  };
 