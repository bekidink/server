import jwt from "jsonwebtoken";
import { Customer, DeliveryPartner } from "../../models/user.js";
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "3d" }
  );
  return { accessToken, refreshToken };
};

export const loginCustomer = async (req, res) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = new Customer({
        phone,
        role: "Customer",
      });
      await customer.save();
    }
    const { accessToken, refreshToken } = generateTokens(customer);
    return res.send({
      message: customer ? "Login Successful" : "Customer created",
      accessToken,
      refreshToken,
      customer,
    });
  } catch (error) {
    return res.status(500).send({
      message: "An error occured",
      error,
    });
  }
};

export const loginDeliveryPartner = async (req, res) => {
  try {
    const { email, password } = req.body;
    let deliveryPartner = await DeliveryPartner.findOne({ email });
    if (!deliveryPartner) {
      return res.status(500).send({
        message: "Delivery Partner not found",
      });
    }
    const isMatch = password === deliveryPartner.password;
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid Credentials" });
    }
    const { accessToken, refreshToken } = generateTokens(deliveryPartner);
    return res.send({
      message: "Login Successful",
      accessToken,
      refreshToken,
      deliveryPartner,
    });
  } catch (error) {
    return res.status(500).send({
      message: "An error occured",
      error,
    });
  }
};
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).send({ message: "Refresh token required" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    let user;
    if (decoded.role === "Customer") {
      user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(decoded.userId);
    } else {
      return res.status(403).send({ message: "Invalid Role" });
    }
    if (!user) {
      return res.status(403).send({ message: "Invalid refresh token" });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    return res.send({
      message: "token",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(403).send({ message: "Invalid Refresh roken" });
  }
};

export const fetchUser = async (req, res) => {
  const { userId, role } = req.user;
  try {
    let user;
    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return res.status(403).send({ message: "Invalid Role" });
    }
    if (!user) {
      return res.status(403).send({ message: "User not found" });
    }
    return res.send({
      message: "Fetched",
      user,
    });
  } catch (error) {}
};
