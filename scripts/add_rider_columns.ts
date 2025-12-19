
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL!);

async function addRiderColumns() {
    console.log("🛠️ Starting Schema Update...");

    try {
        console.log("Adding total_earnings column...");
        await sql`ALTER TABLE riders ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10, 2) DEFAULT 0`;

        console.log("Adding total_deliveries column...");
        await sql`ALTER TABLE riders ADD COLUMN IF NOT EXISTS total_deliveries INTEGER DEFAULT 0`;

        console.log("✅ Schema Update Complete!");

    } catch (error) {
        console.error("❌ Schema Update Failed:", error);
    }
}

addRiderColumns();
