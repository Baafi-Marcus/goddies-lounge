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
    console.log(`[${new Date().toISOString()}] ${method} /api/reservations - IP: ${identifier}`);

    try {
        if (method === 'GET') {
            const { email, phone } = request.query;

            if (email || phone) {
                const results = await sql`
          SELECT * FROM reservations 
          WHERE (length(${email as string || ''}) > 0 AND email = ${email as string || ''}) 
             OR (length(${phone as string || ''}) > 0 AND phone = ${phone as string || ''})
          ORDER BY date DESC, time DESC
        `;
                return response.status(200).json(results);
            }

            // Admin: All reservations
            const allRes = await sql`SELECT * FROM reservations ORDER BY created_at DESC`;
            return response.status(200).json(allRes);
        }

        if (method === 'POST') {
            const { name, email, phone, date, time, guests, tableId, tableName, notes } = request.body;
            await sql`
        INSERT INTO reservations (name, email, phone, date, time, guests, table_id, table_name, notes, status)
        VALUES (${name}, ${email}, ${phone}, ${date}, ${time}, ${guests}, ${tableId || null}, ${tableName || null}, ${notes || ''}, 'pending')
      `;
            return response.status(201).json({ success: true });
        }

        if (method === 'PATCH') {
            const { id, status } = request.body;
            await sql`UPDATE reservations SET status = ${status} WHERE id = ${id}`;
            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('Reservation API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
