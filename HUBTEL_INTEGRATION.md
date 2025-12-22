# Hubtel Integration Guide

This document describes how we will use **Hubtel Ghana** for SMS notifications and Payment processing in the Goddies Lounge application.

## 1. SMS Notifications
We will use the **Hubtel Unity SMS API** to send automated messages for the following events:

| Event | Content | Recipient |
|-------|---------|-----------|
| **Sign-up** | Welcome message + Account confirmation. | New Customer |
| **Order Ready** | Notification that the food is ready for pickup or out for delivery. | Customer |
| **OTP** | Security code for verifying payments or logins. | Customer |

### API Configuration
To enable SMS, we need to configure:
- `HUBTEL_CLIENT_ID`
- `HUBTEL_CLIENT_SECRET`
- `HUBTEL_SENDER_ID` (Your approved Sender Name)

## 2. Payment Gateway
When a customer selects "Pay Online (Hubtel)" during checkout, we will:

1. **Initiate Payment**: The app will call Hubtel's Checkout API.
2. **Redirect**: The user will be taken to Hubtel's secure payment page to pay via Mobile Money or Card.
3. **Verification**: 
   - We will use an **OTP** (generated via Hubtel) to verify the transaction if necessary.
   - We will handle the **Callback URL** to automatically update the order status in our database once payment is successful.

## 3. Environment Variables
Add these to your `.env` file once you have your Hubtel credentials:

```bash
# Hubtel API Credentials
VITE_HUBTEL_CLIENT_ID=your_client_id
VITE_HUBTEL_CLIENT_SECRET=your_client_secret
VITE_HUBTEL_MERCHANT_ID=your_merchant_id
VITE_HUBTEL_SENDER_ID=GoddiesLounge
```

## 4. Implementation Steps
1. **Service Layer**: Create `src/services/hubtel.ts` to handle API requests.
2. **Checkout Logic**: Update `Checkout.tsx` to handle the redirect to Hubtel for online payments.
3. **Admin Alerts**: Update `ManageOrders.tsx` to trigger SMS when status moves to "Ready".

---
> [!IMPORTANT]
> You must ensure your Hubtel account has sufficient **SMS Credits** and the **Sender ID** is white-listed for Ghana.
