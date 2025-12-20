import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ VITE_DATABASE_URL is not defined in .env');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runSetup() {
    console.log('🚀 Starting Database Setup...');

    try {
        // 1. Users Table
        console.log('Creating users table...');
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firebase_uid VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'customer', 'rider')),
        full_name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

        // 2. Riders Table
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

        // 4. Menu Items Table
        console.log('Creating menu_items table...');
        await sql`
      CREATE TABLE IF NOT EXISTS menu_items(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image TEXT,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

        // 5. Orders Table
        console.log('Creating orders table...');
        await sql`
      CREATE TABLE IF NOT EXISTS orders(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        items JSONB NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        delivery_type VARCHAR(20) NOT NULL,
        delivery_address TEXT,
        payment_method VARCHAR(50) DEFAULT 'cod',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

        // 6. Reservations Table
        console.log('Creating reservations table...');
        await sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        guests INTEGER NOT NULL,
        table_id UUID,
        table_name VARCHAR(100),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

        // 7. Locations Table
        console.log('Creating locations table...');
        await sql`
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

        console.log('✅ All tables created successfully!');
    } catch (error) {
        console.error('❌ Database setup failed:', error);
    }
}

runSetup();
