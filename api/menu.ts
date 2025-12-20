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
    console.log(`[${new Date().toISOString()}] ${method} /api/menu - IP: ${identifier}`);

    try {
        if (method === 'GET') {
            const results = await sql`SELECT * FROM menu_items ORDER BY category, name`;
            const transformed = results.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price: Number(item.price),
                category: item.category,
                image: item.image,
                available: item.is_available
            }));

            // Edge Caching: 1 hour browser cache, 24 hour CDN cache
            response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
            return response.status(200).json(transformed);
        }

        if (method === 'POST') {
            // TODO: Add admin authentication check here
            const { name, description, price, category, image, isAvailable } = request.body;
            const [newItem] = await sql`
        INSERT INTO menu_items(name, description, price, category, image, is_available)
        VALUES(${name}, ${description}, ${price}, ${category}, ${image}, ${isAvailable ?? true})
        RETURNING *
      `;
            return response.status(201).json(newItem);
        }

        if (method === 'PUT') {
            const { id, ...updates } = request.body;
            // Simple update logic for production readiness
            if (updates.name !== undefined) await sql`UPDATE menu_items SET name = ${updates.name} WHERE id = ${id} `;
            if (updates.description !== undefined) await sql`UPDATE menu_items SET description = ${updates.description} WHERE id = ${id} `;
            if (updates.price !== undefined) await sql`UPDATE menu_items SET price = ${updates.price} WHERE id = ${id} `;
            if (updates.category !== undefined) await sql`UPDATE menu_items SET category = ${updates.category} WHERE id = ${id} `;
            if (updates.image !== undefined) await sql`UPDATE menu_items SET image = ${updates.image} WHERE id = ${id} `;
            if (updates.isAvailable !== undefined) await sql`UPDATE menu_items SET is_available = ${updates.isAvailable} WHERE id = ${id} `;

            return response.status(200).json({ success: true });
        }

        if (method === 'DELETE') {
            const { id } = request.query;
            await sql`DELETE FROM menu_items WHERE id = ${id as string} `;
            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
