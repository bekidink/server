import {
  Branch,
  Customer,
  DeliveryPartner,
  Order,
} from "../../models/index.js";

export const createOrder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;
    const customerData = await Customer.findById(userId);
    const branchData = await Branch.find(branch);
    if (!customerData) {
      return res.status(404).send({ message: "Customer not found" });
    }
    const newOrder = new Order({
      customer: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),
      branch,
      totalPrice,
      deliveryLocation: {
        latitude: customerData.liveLocation.latitude,
        longitude: customerData.liveLocation.longitude,
        address: customerData.address || "No address available",
      },
      pickupLocation: {
        latitude: branchData.liveLocation.latitude,
        longitude: branchData.liveLocation.longitude,
        address: branchData.address || "No address available",
      },
    });
    const savedOrder = await newOrder.save();
    return res.status(201).send(savedOrder);
  } catch (error) {
    return res.status(500).send({ message: "Failed to create order", error });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation } = req.body;
    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return res.status(404).send({ message: "Delivery Person Not found" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ message: "Order Not found" });
    }
    if (order.status !== "available") {
      return res.status(400).send({ message: "Order is not available" });
    }
    order.status = "confirmed";
    order.deliveryPartner = {
      latitude: deliveryPersonLocation?.latitude,
      longitude: deliveryPersonLocation?.longitude,
      address: deliveryPersonLocation?.address || "",
    };
    req.server.io.to(orderId).emit('orderConfirmed',order)
    await order.save();
    return res.send(order);
  } catch (error) {
    return res.status(500).send({ message: "Failed to confirm order", error });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;
    const { userId } = req.user;
    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return res.status(404).send({ message: "Delivery Person Not found" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ message: "Order Not found" });
    }
    if (["cancelled", "delivered"].includes(order.status)) {
      return res.status(400).send({ message: "Order can not be updated" });
    }
    if (order.deliveryPartner.toString1 !== userId) {
      return res.status(403).send({ message: "Unauthorized" });
    }
    order.status = status;
    order.deliveryLocation = deliveryPersonLocation;
     req.server.io.to(orderId).emit("liveTrackUpdates", order);
    await order.save();
    return res.send(order);
  } catch (error) {
    return res.status(500).send({ message: "Failed to confirm order", error });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, customerId, deliveryPartnerId, branchId } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    if (customerId) {
      query.customerId = customerId;
    }
    if (deliveryPartnerId) {
      query.deliveryPartner = status;
      query.branch = status;
    }
    const orders = await Order.find(query).populate(
      "customer branch items.item deliveryPartner"
    );
    return res.send(orders);
  } catch (error) {
    return res.status(500).send({ message: "Failed to get orders", error });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.query;

    const order = await Order.findById(orderId).populate(
      "customer branch items.item deliveryPartner"
    );
    if (!order) {
      return res.status(404).send({ message: "Order Not found" });
    }
    return res.send(order);
  } catch (error) {
    return res.status(500).send({ message: "Failed to get order", error });
  }
};
