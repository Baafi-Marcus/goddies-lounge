import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from './_db.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const { method } = request;

    try {
        if (method === 'GET') {
            const results = await sql`SELECT * FROM restaurant_tables`;
            return response.status(200).json(results);
        }

        if (method === 'POST') {
            const { tables } = request.body;

            // Note: Neon serverless HTTP doesn't support interactive transactions (BEGIN/COMMIT) 
            // the same way a stateful connection does. We will execute sequentially.
            // For a small number of tables, this is acceptable.

            await sql`DELETE FROM restaurant_tables`;

            for (const t of tables) {
                await sql`
                    INSERT INTO restaurant_tables (id, label, x, y, width, height, seats, shape, type)
                    VALUES (${t.id}, ${t.label}, ${t.x}, ${t.y}, ${t.width}, ${t.height}, ${t.seats}, ${t.shape}, ${t.type})
                `;
            }

            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
