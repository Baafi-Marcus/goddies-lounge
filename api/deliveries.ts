import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from './_db.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const { method } = request;

    try {
        if (method === 'GET') {
            const { riderId, customerId, orderId } = request.query;

            if (orderId) {
                const results = await sql`
          SELECT 
           d.*, r.vehicle_number, r.vehicle_type,
           u.full_name as rider_name, u.phone as rider_phone
          FROM deliveries d
          LEFT JOIN riders r ON d.rider_id = r.id
          LEFT JOIN users u ON r.id = u.id
          WHERE d.order_id = ${orderId as string}
        `;
                return response.status(200).json(results[0]);
            }

            if (riderId) {
                const deliveries = await sql`
          SELECT 
            id, order_id as "orderId", customer_id as "customerId",
            pickup_location as "pickupLocation", delivery_location as "deliveryLocation",
            delivery_fee as "deliveryFee", commission_rate as "commissionRate",
            commission_amount as "commissionAmount", rider_earning as "riderEarning",
            status, verification_code as "verificationCode", 
            confirmation_code as "confirmationCode", created_at, rider_id as "riderId"
          FROM deliveries 
          WHERE rider_id = ${riderId as string} 
          ORDER BY created_at DESC
        `;
                return response.status(200).json(deliveries);
            }

            const allDeliveries = await sql`
        SELECT
          d.id, d.order_id as "orderId", d.customer_id as "customerId",
          d.pickup_location as "pickupLocation", d.delivery_location as "deliveryLocation",
          d.delivery_fee as "deliveryFee", d.commission_rate as "commissionRate",
          d.commission_amount as "commissionAmount", d.rider_earning as "riderEarning",
          d.status, d.verification_code as "verificationCode", 
          d.confirmation_code as "confirmationCode", d.created_at, d.rider_id as "riderId",
          u.full_name as "customerName", u.phone as "customerPhone", o.total_amount as "orderTotal"
        FROM deliveries d 
        LEFT JOIN users u ON d.customer_id::text = u.id::text
        LEFT JOIN orders o ON d.order_id::text = o.id::text
        ORDER BY d.created_at DESC
      `;
            return response.status(200).json(allDeliveries);
        }

        if (method === 'POST') {
            const deliveryData = request.body;
            const [newDelivery] = await sql`
        INSERT INTO deliveries(
          order_id, customer_id, pickup_location, delivery_location,
          delivery_fee, commission_rate, commission_amount, rider_earning,
          status, verification_code, confirmation_code
        ) VALUES(
          ${deliveryData.orderId}, ${deliveryData.customerId}, ${deliveryData.pickupLocation}, ${deliveryData.deliveryLocation},
          ${deliveryData.deliveryFee}, ${deliveryData.commissionRate}, ${deliveryData.commissionAmount}, ${deliveryData.riderEarning},
          'pending', ${deliveryData.verificationCode}, ${deliveryData.confirmationCode}
        )
        RETURNING *
      `;
            return response.status(201).json(newDelivery);
        }

        if (method === 'PATCH') {
            const { action, deliveryId, riderId, earning } = request.body;

            if (action === 'assign') {
                await sql`UPDATE deliveries SET rider_id = ${riderId}, status = 'assigned', assigned_at = NOW() WHERE id = ${deliveryId}`;
            } else if (action === 'pickup') {
                await sql`BEGIN`;
                const [d] = await sql`UPDATE deliveries SET status = 'in_transit', picked_up_at = NOW() WHERE id = ${deliveryId} RETURNING order_id`;
                if (d?.order_id) await sql`UPDATE orders SET status = 'in_transit' WHERE id = ${d.order_id}`;
                await sql`COMMIT`;
            } else if (action === 'complete') {
                await sql`BEGIN`;
                const [d] = await sql`UPDATE deliveries SET status = 'delivered', delivered_at = NOW() WHERE id = ${deliveryId} RETURNING order_id`;
                await sql`UPDATE riders SET total_deliveries = total_deliveries + 1, total_earnings = total_earnings + ${earning}, current_balance = current_balance + ${earning} WHERE id = ${riderId}`;
                if (d?.order_id) await sql`UPDATE orders SET status = 'delivered' WHERE id = ${d.order_id}`;
                await sql`COMMIT`;
            }

            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('Delivery API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
