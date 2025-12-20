import { neon } from '@neondatabase/serverless';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// TODO: Replace with your Neon connection string
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

const sql = neon(DATABASE_URL);

// Rider Service
export const RiderService = {
  async getAllRiders() {
    const { data } = await api.get('/riders');
    return data;
  },

  async getRiderById(id: string) {
    const { data } = await api.get(`/riders?id=${id}`);
    return data;
  },

  async getRiderByRegistration(regNum: string) {
    const { data } = await api.get(`/riders?registrationNumber=${regNum}`);
    return data;
  },

  async createRider(riderData: any) {
    const { data } = await api.post('/riders', riderData);
    return data;
  },

  async updateRider(id: string, updates: any) {
    const { data } = await api.patch('/riders', { id, ...updates });
    return data;
  },

  async deleteRider(id: string) {
    // Note: API implementation for DELETE riders is missing, would add if needed
    // For now, we can use status = 'deleted' via update
    return this.updateRider(id, { status: 'deleted' });
  }
};

// Delivery Service
export const DeliveryService = {
  async getAllDeliveries() {
    const { data } = await api.get('/deliveries');
    return data;
  },

  async getDeliveriesByCustomerId(customerId: string) {
    const { data } = await api.get(`/deliveries?customerId=${customerId}`);
    return data;
  },

  async getDeliveriesByRiderId(riderId: string) {
    const { data } = await api.get(`/deliveries?riderId=${riderId}`);
    return data;
  },

  async createDelivery(deliveryData: any) {
    const { data } = await api.post('/deliveries', deliveryData);
    return data;
  },

  async assignRider(deliveryId: string, riderId: string) {
    await api.patch('/deliveries', { action: 'assign', deliveryId, riderId });
  },

  async pickupDelivery(deliveryId: string) {
    await api.patch('/deliveries', { action: 'pickup', deliveryId });
  },

  async completeDelivery(deliveryId: string, riderId: string, earning: number) {
    await api.patch('/deliveries', { action: 'complete', deliveryId, riderId, earning });
    return true;
  },

  async getDeliveryWithRider(orderId: string) {
    const { data } = await api.get(`/deliveries?orderId=${orderId}`);
    return data;
  }
};

// User Service (Authentication & Profile)
export const UserService = {
  async getUserByFirebaseUid(firebaseUid: string) {
    const { data } = await api.get(`/users?firebaseUid=${firebaseUid}`);
    return data;
  },

  async createUser(userData: {
    firebaseUid: string;
    email?: string | null;
    phone?: string | null;
    fullName?: string | null;
    role: 'customer' | 'admin';
  }) {
    const { data } = await api.post('/users', userData);
    return data;
  },

  async updateUser(id: string, updates: Partial<{ full_name: string; phone: string; email: string }>) {
    await api.patch('/users', { id, ...updates });
  },

  async getAllUsers() {
    const { data } = await api.get('/users');
    return data;
  }
};

// Menu Service
export const MenuService = {
  async ensureTableExists() {
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
      )
    `;
  },

  async getAllItems(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    available?: boolean;
  }>> {
    try {
      const { data } = await api.get('/menu');
      if (!Array.isArray(data)) {
        console.error('API Error: Expected array for /menu but got:', typeof data);
        return [];
      }
      return data;
    } catch (e) {
      console.error('Failed to fetch menu items:', e);
      return [];
    }
  },

  async createItem(item: any) {
    const { data } = await api.post('/menu', item);
    return data;
  },

  async updateItem(id: string, updates: any) {
    const { data } = await api.put('/menu', { id, ...updates });
    return data;
  },

  async deleteItem(id: string) {
    const { data } = await api.delete(`/menu?id=${id}`);
    return data;
  }
};

// Order Service
export const OrderService = {
  async ensureTableExists() {
    await sql`
      CREATE TABLE IF NOT EXISTS orders(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        items JSONB NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        delivery_type VARCHAR(20) NOT NULL, -- 'pickup' or 'delivery'
        delivery_address TEXT,
        payment_method VARCHAR(50) DEFAULT 'cod',
        created_at TIMESTAMP DEFAULT NOW()
      )
      `;
  },

  async createOrder(order: any) {
    const { data } = await api.post('/orders', order);
    return data;
  },

  async getUserOrders(userId: string) {
    const { data } = await api.get(`/orders?userId=${userId}`);
    return data;
  },

  async getOrderById(orderId: string) {
    // Note: We don't have a specific getOne order endpoint yet, 
    // but we can reuse the user filter or fetch all and filter client side for now.
    // For production, we would add GET /api/orders/[id]
    const orders = await this.getUserOrders(''); // Placeholder or fetch all
    return orders.find((o: any) => o.id === orderId);
  },

  async getAllOrders() {
    const { data } = await api.get('/orders');
    return data;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { data } = await api.patch('/orders', { orderId, status });
    return data;
  }
};

export const TableService = {
  async ensureTableExists() {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS restaurant_tables (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          label VARCHAR(50) NOT NULL,
          x INTEGER NOT NULL,
          y INTEGER NOT NULL,
          width INTEGER NOT NULL,
          height INTEGER NOT NULL,
          seats INTEGER NOT NULL,
          shape VARCHAR(20) NOT NULL,
          type VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
    } catch (e: any) {
      // Ignore unique constraint violation on type/index creation race conditions
      if (!e.message.includes('pg_type_typname_nsp_index')) {
        throw e;
      }
    }
  },

  async getLayout() {
    try {
      const results = await sql`SELECT * FROM restaurant_tables`;
      return results.map(row => ({
        id: row.id,
        label: row.label,
        x: row.x,
        y: row.y,
        width: row.width,
        height: row.height,
        seats: row.seats,
        shape: row.shape,
        type: row.type
      }));
    } catch (e: any) {
      if (e.message.includes('relation "restaurant_tables" does not exist')) {
        await this.ensureTableExists();
        return [];
      }
      throw e;
    }
  },

  async saveLayout(tables: any[]) {
    await this.ensureTableExists();
    await sql`BEGIN`;
    try {
      await sql`DELETE FROM restaurant_tables`;
      for (const t of tables) {
        await sql`
                  INSERT INTO restaurant_tables (id, label, x, y, width, height, seats, shape, type)
                  VALUES (${t.id}, ${t.label}, ${t.x}, ${t.y}, ${t.width}, ${t.height}, ${t.seats}, ${t.shape}, ${t.type})
              `;
      }
      await sql`COMMIT`;
    } catch (e) {
      await sql`ROLLBACK`;
      throw e;
    }
  }
};

export const ReservationService = {
  async ensureTableExists() {
    try {
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
              )
          `;
    } catch (e: any) {
      // Ignore unique constraint violation on type/index creation race conditions
      if (!e.message.includes('pg_type_typname_nsp_index')) {
        throw e;
      }
    }
  },

  async createReservation(data: any) {
    const { data: result } = await api.post('/reservations', data);
    return result;
  },

  async getAllReservations() {
    const { data } = await api.get('/reservations');
    return data;
  },

  async getReservationsByUser(email?: string, phone?: string) {
    const { data } = await api.get(`/reservations?email=${email || ''}&phone=${phone || ''}`);
    return data;
  },

  async acceptReservation(id: string) {
    await api.patch('/reservations', { id, status: 'accepted' });
  },

  async cancelReservation(id: string) {
    await api.patch('/reservations', { id, status: 'cancelled' });
  },

  async confirmReservation(id: string) {
    await api.patch('/reservations', { id, status: 'completed' });
  },

  async markNoShow(id: string) {
    await api.patch('/reservations', { id, status: 'no-show' });
  }
};

export const LocationService = {
  async ensureTableExists() {
    await sql`
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
  },

  async getAllLocations() {
    const { data } = await api.get('/locations');
    return data;
  },

  async addLocation(name: string, price: number) {
    const { data } = await api.post('/locations', { name, price });
    return data;
  },

  async updateLocation(id: string, name: string, price: number) {
    const { data } = await api.put('/locations', { id, name, price });
    return data;
  },

  async deleteLocation(id: string) {
    await api.patch('/locations', { id, active: false });
  },

  async seedLocations() {
    await this.ensureTableExists();
    const existing = await this.getAllLocations();
    if (existing.length > 0) return; // Already seeded

    const initialLocations = [
      { name: 'Amanfrom', price: 20 },
      { name: 'Apedwa', price: 25 },
      { name: 'Asafo', price: 20 },
      { name: 'Asiakwa', price: 25 },
      { name: 'Maase', price: 20 },
      { name: 'Apedwa Nkwanta', price: 25 },
      { name: 'Adadientam', price: 20 },
      { name: 'Addo Nkwanta', price: 25 },
      { name: 'Adwumako', price: 25 },
      { name: 'Afiesa', price: 20 },
      { name: 'Agyapoma', price: 25 },
      { name: 'Ahwenease', price: 20 },
      { name: 'Akim Apapam', price: 30 },
      { name: 'Akooko', price: 25 },
      { name: 'Akwadum', price: 20 },
      { name: 'Ayem Adukrom', price: 30 },
      { name: 'Birim Amona', price: 30 },
      { name: 'Nkronso', price: 20 },
      { name: 'Ntabea', price: 25 },
      { name: 'Odumase', price: 20 },
      { name: 'Owuratwum', price: 25 },
      { name: 'Pano', price: 20 },
      { name: 'Potrase', price: 20 },
      { name: 'Sagyimase', price: 25 },
      { name: 'Tete', price: 20 },
      { name: 'Wirekyiren Amanforo', price: 30 },
    ];

    for (const loc of initialLocations) {
      await this.addLocation(loc.name, loc.price);
    }
  },

  async cleanupDuplicateLocations() {
    await this.ensureTableExists();
    // Keep the one with the LATEST created_at or ID (to keep recent edits if any). 
    // Actually typically we keep the oldest, but here it doesn't matter much if they are identical.
    // Let's keep the one with MIN id (oldest) to be stable.
    await sql`
      DELETE FROM locations
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
            ROW_NUMBER() OVER (PARTITION BY name ORDER BY id ASC) as row_num
          FROM locations
        ) t
        WHERE t.row_num > 1
      )
    `;
  }
};

