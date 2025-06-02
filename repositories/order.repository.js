import Order from "../models/order.model.js";

const populateOptions = [
    { path: 'user' },
    { path: 'products.product' },
    { path: 'shipping' },
];

export const createOrder = async (data) => {
    const newOrder = await Order.create(data);
    return await Order.findById(newOrder._id).populate(populateOptions);
};

export const getAllOrders = async ({ page = 1, limit = 10, status, fromDate, toDate }) => {
    const query = {};
    if (status) {
        query.status = status;
    }
    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate);
    }
    const skip = (page - 1) * limit;
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate(populateOptions);
    const total = await Order.countDocuments(query);
    return { orders, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const getOrderById = async (id) => {
    return await Order.findById(id).populate(populateOptions);
};

export const updateOrderStatus = async (id, status) => {
    return await Order.findByIdAndUpdate(
        id, 
        { status, updatedAt: Date.now() },
        { new: true }
    ).populate(populateOptions);
};

export const deleteOrder = async (id) => {
    return await Order.findByIdAndDelete(id);
};

export const getOrdersByUserId = async (userId) => {
    return await Order.find({ user: userId }).populate(populateOptions);
};

export const updateOrder = async (id, updateData) => {
    updateData.updatedAt = Date.now();
    await Order.findByIdAndUpdate(id, updateData);
    return await Order.findById(id).populate(populateOptions);
};