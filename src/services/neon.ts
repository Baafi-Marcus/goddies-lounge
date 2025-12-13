import { neon } from '@neondatabase/serverless';

// TODO: Replace with your Neon connection string
const DATABASE_URL = "postgresql://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

// Rider Service
export const RiderService = {
    async getAllRiders() {
        const riders = await sql`SELECT * FROM riders`;
        return riders;
    },

    async getRiderById(id: string) {
        const riders = await sql`SELECT * FROM riders WHERE id = ${id}`;
        return riders[0];
    },

    async updateStatus(id: string, status: string) {
        await sql`UPDATE riders SET status = ${status} WHERE id = ${id}`;
    }
};

// Delivery Service
export const DeliveryService = {
    async createDelivery(deliveryData: any) {
        // Implementation for creating delivery
    },

    async assignRider(deliveryId: string, riderId: string) {
        await sql`
      UPDATE deliveries 
      SET rider_id = ${riderId}, status = 'assigned', assigned_at = NOW() 
      WHERE id = ${deliveryId}
    `;
    }
};
