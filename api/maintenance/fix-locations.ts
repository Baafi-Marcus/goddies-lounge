import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql from '../_db.js';

export default async function handler(
    _request: VercelRequest,
    response: VercelResponse
) {
    try {
        console.log('🧹 Starting Database Cleanup: Fixing pickup locations...');

        // Update all deliveries that have 'Accra' in their pickup_location
        const result = await sql`
            UPDATE deliveries 
            SET pickup_location = 'Goddies Lounge & wine bar, Akim Asafo'
            WHERE pickup_location ILIKE '%Accra%'
            RETURNING id;
        `;

        return response.status(200).json({
            success: true,
            message: `Updated ${result.length} delivery records.`,
            updated_ids: result.map(r => r.id)
        });
    } catch (error: any) {
        console.error('❌ Database cleanup failed:', error);
        return response.status(500).json({ success: false, error: error.message });
    }
}
