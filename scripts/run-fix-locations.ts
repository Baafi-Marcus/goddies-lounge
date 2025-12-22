import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!dbUrl) {
    console.error('❌ DATABASE_URL or VITE_DATABASE_URL not found in environment.');
    process.exit(1);
}

const sql = neon(dbUrl);

async function run() {
    try {
        console.log('🧹 Starting Database Cleanup: Fixing pickup locations...');

        // Update all deliveries that have 'Accra' or 'Goodies' in their pickup_location
        const result = await sql`
            UPDATE deliveries 
            SET pickup_location = 'Goddies Lounge & wine bar, Akim Asafo'
            WHERE pickup_location ILIKE '%Accra%' 
               OR pickup_location ILIKE '%Goodies%'
            RETURNING id;
        `;

        console.log(`✅ Success! Updated ${result.length} delivery records.`);
        if (result.length > 0) {
            console.log('Updated IDs:', result.map(r => r.id).join(', '));
        }
    } catch (error: any) {
        console.error('❌ Database cleanup failed:', error);
        process.exit(1);
    }
}

run();
