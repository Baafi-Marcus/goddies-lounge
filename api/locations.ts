import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from './_db.js';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    const { method } = request;

    try {
        if (method === 'GET') {
            const results = await sql`
        SELECT * FROM locations 
        WHERE active = TRUE 
        ORDER BY name ASC
      `;
            return response.status(200).json(results);
        }

        if (method === 'POST') {
            const { name, price } = request.body;
            const [newLoc] = await sql`
        INSERT INTO locations (name, price)
        VALUES (${name}, ${price})
        RETURNING *
      `;
            return response.status(201).json(newLoc);
        }

        if (method === 'PUT') {
            const { id, name, price } = request.body;
            const [updated] = await sql`
                UPDATE locations 
                SET name = ${name}, price = ${price}
                WHERE id = ${id}
                RETURNING *
            `;
            return response.status(200).json(updated);
        }

        if (method === 'PATCH') {
            const { id, active } = request.body;
            await sql`
                UPDATE locations 
                SET active = ${active}
                WHERE id = ${id}
            `;
            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('Location API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
