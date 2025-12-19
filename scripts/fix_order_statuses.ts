
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL!);

async function fixOrderStatuses() {
    console.log("🛠️ Starting Order Status Repair...");

    try {
        // 1. Find deliveries that are 'delivered' but their order is NOT 'delivered'
        const deliveredMismatches = await sql`
            SELECT d.id as delivery_id, d.order_id, d.status as delivery_status, o.status as order_status
            FROM deliveries d
            JOIN orders o ON d.order_id::text = o.id::text
            WHERE d.status = 'delivered' AND o.status != 'delivered'
        `;

        console.log(`Phase 1: Found ${deliveredMismatches.length} delivered orders with incorrect status.`);

        for (const item of deliveredMismatches) {
            await sql`UPDATE orders SET status = 'delivered' WHERE id = ${item.order_id}`;
            console.log(` -> Fixed Order ${item.order_id}: Set to 'delivered'`);
        }

        // 2. Find deliveries that are 'in_transit' but their order is NOT 'in_transit' (and not delivered)
        const transitMismatches = await sql`
            SELECT d.id as delivery_id, d.order_id, d.status as delivery_status, o.status as order_status
            FROM deliveries d
            JOIN orders o ON d.order_id::text = o.id::text
            WHERE d.status = 'in_transit' AND o.status != 'in_transit' AND o.status != 'delivered'
        `;

        console.log(`Phase 2: Found ${transitMismatches.length} in_transit orders with incorrect status.`);

        for (const item of transitMismatches) {
            await sql`UPDATE orders SET status = 'in_transit' WHERE id = ${item.order_id}`;
            console.log(` -> Fixed Order ${item.order_id}: Set to 'in_transit'`);
        }

        console.log("✅ Order Status Repair Complete!");

    } catch (error) {
        console.error("❌ Failed to repair orders:", error);
    }
}

fixOrderStatuses();
