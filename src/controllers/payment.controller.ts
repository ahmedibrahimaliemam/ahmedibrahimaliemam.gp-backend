import axios from "axios";
import Parent from "../models/parent.model";
import { RequestHandler } from "express";
import dotenv from "dotenv";

dotenv.config();

// STEP 1: Initiate Subscription Payment
export const initiateSubscriptionPayment: RequestHandler = async (req, res) => {
  const { amount } = req.body;
  const parentId = (req as any).user._id;

  const parent = await Parent.findById(parentId);
  if (!parent)
  {
   res.status(404).json({ message: "Parent not found" });
   return;
  }
  try {
    // Get Paymob Token
    const { data: authResp } = await axios.post("https://accept.paymob.com/api/auth/tokens", {
      api_key: process.env.PAYMOB_API_KEY,
    });
    const token = authResp.token;

    // Create Order
    const { data: orderResp } = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
      auth_token: token,
      delivery_needed: false,
      amount_cents: (amount * 100).toString(),
      currency: "EGP",
      items: [],
    });

    // Save Paymob Order ID to Parent
    parent.paymobOrderId = orderResp.id;
    await parent.save();

    // Create Payment Key
    const { data: payKeyResp } = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
      auth_token: token,
      amount_cents: (amount * 100).toString(),
      expiration: 3600,
      order_id: orderResp.id,
      billing_data: {
        apartment: "NA",
        email: parent.email,
        floor: "NA",
        first_name: parent.name,
        street: "NA",
        building: "NA",
        phone_number: parent.phoneNumber,
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        last_name: "N/A",
        state: "Cairo"
      },
      currency: "EGP",
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
    });

    const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${payKeyResp.token}`;
    res.json({ iframeURL });

  } catch (error: any) {
    console.error("Payment error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error initiating payment", error });
  }
};


export const paymobCallback: RequestHandler = async (req, res) => {
  try {
    console.log("Paymob callback received:", req.body);

    const { obj } = req.body;

    if (!obj?.order?.id) {
      res.status(400).json({ message: "Invalid callback payload" });
      return;
    }

    const parent = await Parent.findOne({ paymobOrderId: obj.order.id });
    if (!parent) {
      res.status(404).json({ message: "Parent not found for order" });
      return; 
    }

    if (obj.success) {
      parent.isSubscribed = true;
      parent.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await parent.save();
    }

    res.status(200).json({ message: "Payment status processed" });
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
