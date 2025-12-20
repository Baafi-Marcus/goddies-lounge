import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from './_db.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const { method } = request;

    try {
        if (method === 'GET') {
            const { id, registrationNumber } = request.query;

            if (id) {
                const riders = await sql`SELECT r.*, u.full_name as name, u.phone, u.email FROM riders r JOIN users u ON r.id = u.id WHERE r.id = ${id as string} `;
                return response.status(200).json(riders[0]);
            }

            if (registrationNumber) {
                const riders = await sql`SELECT r.*, u.full_name as name, u.phone, u.email FROM riders r JOIN users u ON r.id = u.id WHERE r.registration_number = ${registrationNumber as string} `;
                return response.status(200).json(riders[0]);
            }

            const allRiders = await sql`
        SELECT
          r.id, r.registration_number as "registrationNumber", r.vehicle_type as "vehicleType",
          r.vehicle_number as "vehicleNumber", r.status,
          r.total_deliveries as "totalDeliveries",
          r.total_earnings as "totalEarnings",
          r.current_balance as "currentBalance",
          u.full_name as name, u.phone, u.email 
        FROM riders r 
        JOIN users u ON r.id = u.id
      `;
            return response.status(200).json(allRiders);
        }

        if (method === 'POST') {
            const riderData = request.body;
            const [user] = await sql`
        INSERT INTO users(email, password_hash, role, full_name, phone)
        VALUES(${riderData.email}, ${riderData.password}, 'rider', ${riderData.name}, ${riderData.phone})
        RETURNING id
      `;

            await sql`
        INSERT INTO riders(id, registration_number, vehicle_type, vehicle_number, status)
        VALUES(${user.id}, ${riderData.registrationNumber}, ${riderData.vehicleType}, ${riderData.vehicleNumber}, ${riderData.status || 'pending'})
      `;
            return response.status(201).json({ id: user.id });
        }

        if (method === 'PATCH') {
            const { id, ...updates } = request.body;
            await sql`BEGIN`;
            try {
                if (updates.status) await sql`UPDATE riders SET status = ${updates.status} WHERE id = ${id} `;
                if (updates.currentBalance !== undefined) await sql`UPDATE riders SET current_balance = ${updates.currentBalance} WHERE id = ${id} `;
                if (updates.totalDeliveries !== undefined) await sql`UPDATE riders SET total_deliveries = ${updates.totalDeliveries} WHERE id = ${id} `;
                if (updates.totalEarnings !== undefined) await sql`UPDATE riders SET total_earnings = ${updates.totalEarnings} WHERE id = ${id} `;

                if (updates.name) await sql`UPDATE users SET full_name = ${updates.name} WHERE id = ${id}`;
                if (updates.phone) await sql`UPDATE users SET phone = ${updates.phone} WHERE id = ${id}`;

                await sql`COMMIT`;
                return response.status(200).json({ success: true });
            } catch (e) {
                await sql`ROLLBACK`;
                throw e;
            }
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('Rider API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
