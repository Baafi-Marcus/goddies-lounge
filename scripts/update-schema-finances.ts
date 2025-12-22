import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ VITE_DATABASE_URL is not defined in .env');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function updateSchema() {
    console.log('🚀 Updating Database Schema for Financials & Pickups...');

    try {
        // 1. Update Riders Table
        console.log('Updating riders table...');
        await sql`
            ALTER TABLE riders 
            ADD COLUMN IF NOT EXISTS payment_preference VARCHAR(20) DEFAULT 'momo',
            ADD COLUMN IF NOT EXISTS momo_number VARCHAR(20);
        `;

        // 2. Update Deliveries Table
        console.log('Updating deliveries table...');
        await sql`
            ALTER TABLE deliveries 
            ADD COLUMN IF NOT EXISTS cash_settled_by_rider BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS earning_paid_by_admin BOOLEAN DEFAULT FALSE;
        `;

        // 3. Update Orders Table
        console.log('Updating orders table...');
        await sql`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS pickup_time VARCHAR(50);
        `;

        console.log('✅ Schema updated successfully!');
    } catch (error) {
        console.error('❌ Schema update failed:', error);
    }
}

updateSchema();
