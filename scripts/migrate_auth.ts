
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Hardcoded for now as per previous context, but normally we'd load from .env
const DATABASE_URL = "postgresql://neondb_owner:npg_T8uw4AYeVtls@ep-floral-pond-ade94g00-pooler.c-2.us-east-1.aws.neon.tech/goddies?sslmode=require";

const sql = neon(DATABASE_URL);

async function runMigration() {
    console.log('Starting Auth Migration...');

    try {
        // 1. Add firebase_uid column
        console.log('Adding firebase_uid column...');
        await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE
    `;

        // 2. Make email optional (DROP NOT NULL)
        console.log('Altering email column...');
        await sql`
      ALTER TABLE users 
      ALTER COLUMN email DROP NOT NULL
    `;

        // 3. Make password_hash optional (DROP NOT NULL)
        console.log('Altering password_hash column...');
        await sql`
      ALTER TABLE users 
      ALTER COLUMN password_hash DROP NOT NULL
    `;

        // 4. Add unique constraint to phone if not exists (for phone auth lookup)
        // Checking if unique constraint exists is hard in raw sql in one go, 
        // but we can try adding it and ignore error, or just assume it's okay.
        // Let's safe-guard by trying to add a unique index concurrently or just normal unique constraint.
        console.log('Ensure phone is unique...');
        try {
            await sql`ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone)`;
        } catch (e: any) {
            if (e.message.includes('already exists')) {
                console.log('Phone unique constraint already exists.');
            } else {
                console.warn('Could not add phone unique constraint (might have duplicates):', e.message);
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
