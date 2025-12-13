import { neon } from '@neondatabase/serverless';

// TODO: Replace with your Neon connection string
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

const sql = neon(DATABASE_URL);

// Rider Service
export const RiderService = {
  async getAllRiders() {
    return await sql`SELECT r.*, u.full_name as name, u.phone, u.email FROM riders r JOIN users u ON r.id = u.id`;
  },

  async getRiderById(id: string) {
    const riders = await sql`SELECT r.*, u.full_name as name, u.phone, u.email FROM riders r JOIN users u ON r.id = u.id WHERE r.id = ${id}`;
    return riders[0];
  },

  async getRiderByRegistration(regNum: string) {
    const riders = await sql`SELECT r.*, u.full_name as name, u.phone, u.email FROM riders r JOIN users u ON r.id = u.id WHERE r.registration_number = ${regNum}`;
    return riders[0];
  },

  async createRider(riderData: any) {
    // 1. Create User
    const [user] = await sql`
      INSERT INTO users (email, password_hash, role, full_name, phone)
      VALUES (${riderData.email}, ${riderData.password}, 'rider', ${riderData.name}, ${riderData.phone})
      RETURNING id
    `;

    // 2. Create Rider Profile
    await sql`
      INSERT INTO riders (id, registration_number, vehicle_type, vehicle_number, status)
      VALUES (${user.id}, ${riderData.registrationNumber}, ${riderData.vehicleType}, ${riderData.vehicleNumber}, ${riderData.status || 'pending'})
    `;

    return user.id;
  },

  async updateRider(id: string, updates: any) {
    // Separate rider-specific fields from user fields could be cleaner, but for now assuming simple updates
    // This is a simplified update
    if (updates.status) await sql`UPDATE riders SET status = ${updates.status} WHERE id = ${id}`;
    if (updates.currentBalance !== undefined) await sql`UPDATE riders SET current_balance = ${updates.currentBalance} WHERE id = ${id}`;
    if (updates.totalDeliveries !== undefined) await sql`UPDATE riders SET total_deliveries = ${updates.totalDeliveries} WHERE id = ${id}`;
    if (updates.totalEarnings !== undefined) await sql`UPDATE riders SET total_earnings = ${updates.totalEarnings} WHERE id = ${id}`;
    if (updates.lastActive) { /* last_active column missing in schema, let's skip or add it later */ }
  },

  async deleteRider(id: string) {
    await sql`DELETE FROM riders WHERE id = ${id}`;
    await sql`DELETE FROM users WHERE id = ${id}`;
  }
};

// Delivery Service
export const DeliveryService = {
  async getAllDeliveries() {
    return await sql`
      SELECT d.*, 
             u.full_name as customer_name, 
             u.phone as customer_phone 
      FROM deliveries d 
      LEFT JOIN users u ON d.customer_id = u.id
      ORDER BY created_at DESC
    `;
  },

  async getDeliveriesByCustomerId(customerId: string) {
    return await sql`
      SELECT * FROM deliveries 
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
    `;
  },

  async createDelivery(deliveryData: any) {
    return await sql`
      INSERT INTO deliveries (
        order_id, customer_id, pickup_location, delivery_location, 
        delivery_fee, commission_rate, commission_amount, rider_earning,
        status, verification_code, confirmation_code
      ) VALUES (
        ${deliveryData.orderId}, ${deliveryData.customerId}, ${deliveryData.pickupLocation}, ${deliveryData.deliveryLocation},
        ${deliveryData.deliveryFee}, ${deliveryData.commissionRate}, ${deliveryData.commissionAmount}, ${deliveryData.riderEarning},
        'pending', ${deliveryData.verificationCode}, ${deliveryData.confirmationCode}
      )
      RETURNING *
    `;
  },

  async assignRider(deliveryId: string, riderId: string) {
    await sql`
      UPDATE deliveries 
      SET rider_id = ${riderId}, status = 'assigned', assigned_at = NOW() 
      WHERE id = ${deliveryId}
    `;
  },

  async pickupDelivery(deliveryId: string) {
    await sql`
      UPDATE deliveries 
      SET status = 'in_transit', picked_up_at = NOW() 
      WHERE id = ${deliveryId}
    `;
  },

  async completeDelivery(deliveryId: string, riderId: string, earning: number) {
    // Transaction-like atomic update
    await sql`BEGIN`;
    try {
      // 1. Update Delivery
      await sql`
        UPDATE deliveries 
        SET status = 'delivered', delivered_at = NOW() 
        WHERE id = ${deliveryId}
      `;

      // 2. Update Rider Stats
      await sql`
        UPDATE riders 
        SET total_deliveries = total_deliveries + 1,
            total_earnings = total_earnings + ${earning},
            current_balance = current_balance + ${earning}
        WHERE id = ${riderId}
      `;

      await sql`COMMIT`;
      return true;
    } catch (e) {
      await sql`ROLLBACK`;
      throw e;
    }
  },

  async getDeliveryWithRider(orderId: string) {
    const results = await sql`
      SELECT d.*, 
             r.vehicle_number, r.vehicle_type,
             u.full_name as rider_name, u.phone as rider_phone
      FROM deliveries d
      LEFT JOIN riders r ON d.rider_id = r.id
      LEFT JOIN users u ON r.id = u.id
      WHERE d.order_id = ${orderId}
    `;
    return results[0];
  }
};

// User Service (Authentication & Profile)
export const UserService = {
  async getUserByFirebaseUid(firebaseUid: string) {
    const users = await sql`SELECT * FROM users WHERE firebase_uid = ${firebaseUid}`;
    return users[0];
  },

  async createUser(userData: {
    firebaseUid: string;
    email?: string | null;
    phone?: string | null;
    fullName?: string | null;
    role: 'customer' | 'admin';
  }) {
    const [user] = await sql`
      INSERT INTO users (firebase_uid, email, phone, full_name, role)
      VALUES (
        ${userData.firebaseUid}, 
        ${userData.email || null}, 
        ${userData.phone || null}, 
        ${userData.fullName || 'New User'}, 
        ${userData.role}
      )
      RETURNING *
    `;
    return user;
  },

  async updateUser(id: string, updates: Partial<{ full_name: string; phone: string; email: string }>) {
    // Dynamic query construction would be better, but simple static checks for now
    if (updates.full_name) await sql`UPDATE users SET full_name = ${updates.full_name} WHERE id = ${id}`;
    if (updates.phone) await sql`UPDATE users SET phone = ${updates.phone} WHERE id = ${id}`;
    if (updates.email) await sql`UPDATE users SET email = ${updates.email} WHERE id = ${id}`;
  },

  async getAllUsers() {
    return await sql`SELECT * FROM users ORDER BY created_at DESC`;
  }
};

// Menu Service
export const MenuService = {
  async ensureTableExists() {
    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
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
    // Auto-create table on first fetch if missing (simple migration strat)
    try {
      const results = await sql`SELECT * FROM menu_items ORDER BY category, name`;
      // Transform database results to match MenuItem interface
      return results.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        category: item.category,
        image: item.image,
        available: item.is_available
      }));
    } catch (e: any) {
      if (e.message.includes('relation "menu_items" does not exist')) {
        await this.ensureTableExists();
        return [];
      }
      throw e;
    }
  },

  async createItem(item: any) {
    await this.ensureTableExists(); // Ensure table exists before write
    return await sql`
      INSERT INTO menu_items (name, description, price, category, image, is_available)
      VALUES (${item.name}, ${item.description}, ${item.price}, ${item.category}, ${item.image}, ${item.isAvailable ?? true})
      RETURNING *
    `;
  },

  async updateItem(id: string, updates: any) {
    // Simplified update logic to avoid complex dynamic query construction issues
    if (updates.name !== undefined) await sql`UPDATE menu_items SET name = ${updates.name} WHERE id = ${id}`;
    if (updates.description !== undefined) await sql`UPDATE menu_items SET description = ${updates.description} WHERE id = ${id}`;
    if (updates.price !== undefined) await sql`UPDATE menu_items SET price = ${updates.price} WHERE id = ${id}`;
    if (updates.category !== undefined) await sql`UPDATE menu_items SET category = ${updates.category} WHERE id = ${id}`;
    if (updates.image !== undefined) await sql`UPDATE menu_items SET image = ${updates.image} WHERE id = ${id}`;
    if (updates.isAvailable !== undefined) await sql`UPDATE menu_items SET is_available = ${updates.isAvailable} WHERE id = ${id}`;
  },

  async deleteItem(id: string) {
    await sql`DELETE FROM menu_items WHERE id = ${id}`;
  }
};

// Order Service
export const OrderService = {
  async ensureTableExists() {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
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
    await this.ensureTableExists();
    // Verify user exists first? Assuming auth context handles this.
    const [newOrder] = await sql`
      INSERT INTO orders (user_id, items, total_amount, status, delivery_type, delivery_address, payment_method)
      VALUES (
        ${order.userId}, 
        ${JSON.stringify(order.items)}, 
        ${order.totalAmount}, 
        ${order.status || 'pending'}, 
        ${order.deliveryType}, 
        ${order.deliveryAddress}, 
        ${order.paymentMethod}
      )
      RETURNING *
    `;
    return newOrder;
  },

  async getUserOrders(userId: string) {
    try {
      return await sql`SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC`;
    } catch (e: any) {
      if (e.message.includes('relation "orders" does not exist')) {
        await this.ensureTableExists();
        return [];
      }
      throw e;
    }
  },

  async getOrderById(orderId: string) {
    const orders = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
    return orders[0];
  },

  async getAllOrders() {
    try {
      // Join with users to get customer name
      return await sql`
        SELECT o.*, u.full_name as customer_name, u.phone as customer_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `;
    } catch (e: any) {
      if (e.message.includes('relation "orders" does not exist')) {
        await this.ensureTableExists();
        return [];
      }
      throw e;
    }
  },

  async updateOrderStatus(orderId: string, status: string) {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${orderId}`;
  }
};
