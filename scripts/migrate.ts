import { neon } from '@neondatabase/serverless';

import * as dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;
const sql = neon(DATABASE_URL);

async function runMigrations() {
  console.log('Starting migrations...');

  try {
    // 1. Users Table (Core)
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'customer', 'rider')),
        full_name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // 2. Riders Table (Extension)
    console.log('Creating riders table...');
    await sql`
      CREATE TABLE IF NOT EXISTS riders (
        id UUID PRIMARY KEY REFERENCES users(id),
        registration_number VARCHAR(20) UNIQUE NOT NULL,
        vehicle_type VARCHAR(50) NOT NULL,
        vehicle_number VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        current_balance DECIMAL(10, 2) DEFAULT 0.00,
        total_deliveries INT DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 5.00
      );
    `;

    // 3. Deliveries Table
    console.log('Creating deliveries table...');
    await sql`
      CREATE TABLE IF NOT EXISTS deliveries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR(50) NOT NULL,
        rider_id UUID REFERENCES riders(id),
        customer_id UUID REFERENCES users(id),
        
        pickup_location TEXT NOT NULL,
        delivery_location TEXT NOT NULL,
        delivery_distance_km DECIMAL(5,2),
        
        delivery_fee DECIMAL(10, 2) NOT NULL,
        commission_rate DECIMAL(5, 2) NOT NULL,
        commission_amount DECIMAL(10, 2) NOT NULL,
        rider_earning DECIMAL(10, 2) NOT NULL,
        
        status VARCHAR(50) DEFAULT 'pending',
        qr_code_data TEXT,
        verification_code VARCHAR(6),
        confirmation_code VARCHAR(6),
        
        assigned_at TIMESTAMP,
        picked_up_at TIMESTAMP,
        delivered_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigrations();
