import axios from "axios";
import Parent from "../models/parent.model";
import { RequestHandler } from "express";
import dotenv from "dotenv";
dotenv.config();
//payment
export const initiateSubscriptionPayment: RequestHandler = async (req, res) => {
  const { parentId, amount } = req.body;

  const parent = await Parent.findById(parentId);
  if (!parent) 
    { 
      res.status(404).json({ message: "Parent not found" });
      return;
    }
  try {
    // 1. Get Auth Token
    const { data: authResp } = await axios.post("https://accept.paymob.com/api/auth/tokens", {
      api_key: process.env.PAYMOB_API_KEY
    });

    const token = authResp.token;

    // 2. Create Order
    const { data: orderResp } = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
      auth_token: token,
      delivery_needed: false,
      amount_cents: (amount * 100).toString(),
      currency: "EGP",
      items: []
    });

    // 3. Payment Key
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
        last_name: "Farhan",
        state: "Cairo"
      },
      currency: "EGP",
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID)
    });

    const paymentToken = payKeyResp.token;

    // 4. Send iframe link to frontend
    const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
    res.json({ iframeURL });

  } catch (error:any) {
    console.error("Payment error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error initiating payment", error });
  }
};
