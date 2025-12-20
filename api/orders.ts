import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from './_db.js';
import { checkRateLimit } from './_ratelimit.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // Rate limiting based on IP
    const identifier = request.headers['x-forwarded-for'] || '127.0.0.1';
    const { success } = await checkRateLimit(identifier as string);
    if (!success) {
        return response.status(429).json({ error: 'Too Many Requests' });
    }

    const { method } = request;

    // Structured Logging
    console.log(`[${new Date().toISOString()}] ${method} /api/orders - IP: ${identifier}`);

    try {
        if (method === 'GET') {
            const { userId } = request.query;
            if (userId) {
                // Fetch user specific orders
                const orders = await sql`SELECT * FROM orders WHERE user_id = ${userId as string} ORDER BY created_at DESC`;
                return response.status(200).json(orders);
            }

            // Admin: Fetch all orders with user details
            const allOrders = await sql`
        SELECT 
          o.*, 
          u.full_name as customer_name, 
          u.phone as customer_phone,
          d.verification_code,
          d.confirmation_code
        FROM orders o
        LEFT JOIN users u ON o.user_id::text = u.id::text
        LEFT JOIN deliveries d ON o.id::text = d.order_id::text
        ORDER BY o.created_at DESC
      `;
            return response.status(200).json(allOrders);
        }

        if (method === 'POST') {
            const { userId, items, totalAmount, status, deliveryType, deliveryAddress, paymentMethod } = request.body;

            const [newOrder] = await sql`
        INSERT INTO orders(user_id, items, total_amount, status, delivery_type, delivery_address, payment_method)
        VALUES(
          ${userId},
          ${JSON.stringify(items)},
          ${totalAmount},
          ${status || 'pending'},
          ${deliveryType},
          ${deliveryAddress},
          ${paymentMethod}
        )
        RETURNING *
      `;
            return response.status(201).json(newOrder);
        }

        if (method === 'PATCH') {
            const { orderId, status } = request.body;
            await sql`UPDATE orders SET status = ${status} WHERE id = ${orderId} `;
            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('Order API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
