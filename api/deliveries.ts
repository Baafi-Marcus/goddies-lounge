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
            d.id, d.order_id as "orderId", d.customer_id as "customerId",
            d.pickup_location as "pickupLocation", d.delivery_location as "deliveryLocation",
            d.delivery_fee as "deliveryFee", d.commission_rate as "commissionRate",
            d.commission_amount as "commissionAmount", d.rider_earning as "riderEarning",
            d.status, d.verification_code as "verificationCode", 
            d.confirmation_code as "confirmationCode", d.created_at, d.rider_id as "riderId",
            u.full_name as "customerName", u.phone as "customerPhone"
          FROM deliveries d
          LEFT JOIN users u ON d.customer_id::text = u.id::text
          WHERE d.rider_id = ${riderId as string} 
          ORDER BY d.created_at DESC
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
                await sql`UPDATE deliveries SET rider_id = ${riderId}, status = 'offered', assigned_at = NOW() WHERE id = ${deliveryId} `;
                // Note: We don't update order status to 'assigned' yet, we wait for rider acceptance.
                // But maybe we should show 'Finding Rider' or 'Rider Offered'? 
                // Let's keep order status as 'ready' or maybe a new 'offered' status? 
                // For simplicity, let's update order to 'assigned' so Admin sees "Assigned (Offered)" or similar.
                // ACTUALLY: User said "Admin: When you assign a rider, the status will now change to 'Offered'".
                const [d] = await sql`SELECT order_id FROM deliveries WHERE id = ${deliveryId}`;
                if (d?.order_id) await sql`UPDATE orders SET status = 'offered' WHERE id = ${d.order_id} `;

            } else if (action === 'accept_offer') {
                // Rider accepts the offer
                await sql`UPDATE deliveries SET status = 'assigned' WHERE id = ${deliveryId} AND rider_id = ${riderId}`;
                const [d] = await sql`SELECT order_id FROM deliveries WHERE id = ${deliveryId}`;
                if (d?.order_id) await sql`UPDATE orders SET status = 'assigned' WHERE id = ${d.order_id} `;

            } else if (action === 'pickup') {
                const [d] = await sql`UPDATE deliveries SET status = 'in_transit', picked_up_at = NOW() WHERE id = ${deliveryId} RETURNING order_id`;
                if (d?.order_id) await sql`UPDATE orders SET status = 'in_transit' WHERE id = ${d.order_id} `;
            } else if (action === 'complete') {
                const [d] = await sql`UPDATE deliveries SET status = 'delivered', delivered_at = NOW() WHERE id = ${deliveryId} RETURNING order_id`;
                await sql`UPDATE riders SET total_deliveries = total_deliveries + 1, total_earnings = total_earnings + ${earning}, current_balance = current_balance + ${earning} WHERE id = ${riderId} `;
                if (d?.order_id) await sql`UPDATE orders SET status = 'delivered' WHERE id = ${d.order_id} `;
            } else if (action === 'user_confirm') {
                const { orderId, code } = request.body;
                // 1. Get the delivery and rider info
                const [delivery] = await sql`SELECT * FROM deliveries WHERE order_id = ${orderId}`;

                if (!delivery) throw new Error("Delivery not found");

                // Optional: Verify code if needed. For now assuming code IS the confirmation.
                // If scanned text is valid...

                // 2. Mark as delivered
                const [d] = await sql`UPDATE deliveries SET status = 'delivered', delivered_at = NOW() WHERE id = ${delivery.id} RETURNING order_id, rider_id, rider_earning`;

                // 3. Pay the rider
                if (d && d.rider_id) {
                    await sql`UPDATE riders SET total_deliveries = total_deliveries + 1, total_earnings = total_earnings + ${d.rider_earning}, current_balance = current_balance + ${d.rider_earning} WHERE id = ${d.rider_id} `;
                }

                // 4. Update Order
                if (d?.order_id) await sql`UPDATE orders SET status = 'delivered' WHERE id = ${d.order_id} `;
            }

            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('Delivery API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
