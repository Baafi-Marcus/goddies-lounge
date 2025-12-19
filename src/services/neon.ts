import { neon } from '@neondatabase/serverless';

// TODO: Replace with your Neon connection string
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

const sql = neon(DATABASE_URL);

// Rider Service
export const RiderService = {
  async getAllRiders() {
    return await sql`
      SELECT
    r.id, r.registration_number as "registrationNumber", r.vehicle_type as "vehicleType",
      r.vehicle_number as "vehicleNumber", r.status,
      r.total_deliveries as "totalDeliveries",
      r.total_earnings as "totalEarnings",
      r.current_balance as "currentBalance",
      u.full_name as name, u.phone, u.email 
      FROM riders r 
      JOIN users u ON r.id = u.id
      `;
  },

  async getRiderById(id: string) {
    const riders = await sql`SELECT r.*, u.full_name as name, u.phone, u.email FROM riders r JOIN users u ON r.id = u.id WHERE r.id = ${id} `;
    return riders[0];
  },

  async getRiderByRegistration(regNum: string) {
    const riders = await sql`SELECT r.*, u.full_name as name, u.phone, u.email FROM riders r JOIN users u ON r.id = u.id WHERE r.registration_number = ${regNum} `;
    return riders[0];
  },

  async createRider(riderData: any) {
    // 1. Create User
    const [user] = await sql`
      INSERT INTO users(email, password_hash, role, full_name, phone)
    VALUES(${riderData.email}, ${riderData.password}, 'rider', ${riderData.name}, ${riderData.phone})
      RETURNING id
      `;

    // 2. Create Rider Profile
    await sql`
      INSERT INTO riders(id, registration_number, vehicle_type, vehicle_number, status)
    VALUES(${user.id}, ${riderData.registrationNumber}, ${riderData.vehicleType}, ${riderData.vehicleNumber}, ${riderData.status || 'pending'})
    `;

    return user.id;
  },

  async updateRider(id: string, updates: any) {
    // Transaction to update both users and riders tables
    await sql`BEGIN`;
    try {
      // 1. Update Rider specific fields
      if (updates.status) await sql`UPDATE riders SET status = ${updates.status} WHERE id = ${id} `;
      if (updates.currentBalance !== undefined) await sql`UPDATE riders SET current_balance = ${updates.currentBalance} WHERE id = ${id} `;
      if (updates.totalDeliveries !== undefined) await sql`UPDATE riders SET total_deliveries = ${updates.totalDeliveries} WHERE id = ${id} `;
      if (updates.totalEarnings !== undefined) await sql`UPDATE riders SET total_earnings = ${updates.totalEarnings} WHERE id = ${id} `;
      if (updates.vehicleType) await sql`UPDATE riders SET vehicle_type = ${updates.vehicleType} WHERE id = ${id} `;
      if (updates.registrationNumber) await sql`UPDATE riders SET registration_number = ${updates.registrationNumber} WHERE id = ${id} `;
      if (updates.vehicleNumber) await sql`UPDATE riders SET vehicle_number = ${updates.vehicleNumber} WHERE id = ${id} `;

      // 2. Update User fields (Name, Phone)
      if (updates.name || updates.phone) {
        if (updates.name) await sql`UPDATE users SET full_name = ${updates.name} WHERE id = ${id}`;
        if (updates.phone) await sql`UPDATE users SET phone = ${updates.phone} WHERE id = ${id}`;
      }

      await sql`COMMIT`;
    } catch (e) {
      await sql`ROLLBACK`;
      throw e;
    }
  },

  async deleteRider(id: string) {
    await sql`DELETE FROM riders WHERE id = ${id} `;
    await sql`DELETE FROM users WHERE id = ${id} `;
  }
};

// Delivery Service
export const DeliveryService = {
  async getAllDeliveries() {
    return await sql`
    SELECT
    d.id, d.order_id as "orderId", d.customer_id as "customerId",
      d.pickup_location as "pickupLocation", d.delivery_location as "location", d.delivery_location as "deliveryAddress",
      d.delivery_fee as "deliveryFee", d.commission_rate as "commissionRate",
      d.commission_amount as "commissionAmount", d.rider_earning as "riderEarning",
      0 as "driverTip", d.status, d.created_at as "createdAt",
      d.rider_id as "riderId", d.verification_code as "verificationCode",
      d.confirmation_code as "customerConfirmationCode", NULL as "pickupTime",
      d.picked_up_at as "pickedUpAt", d.delivered_at as "deliveredAt",
      u.full_name as "customerName",
      u.phone as "customerPhone",
      o.total_amount as "orderTotal"
      FROM deliveries d 
      LEFT JOIN users u ON d.customer_id::text = u.id::text
      LEFT JOIN orders o ON d.order_id::text = o.id::text
      ORDER BY d.created_at DESC
      `;
  },

  async getDeliveriesByCustomerId(customerId: string) {
    return await sql`
    SELECT * FROM deliveries 
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
      `;
  },

  async getDeliveriesByRiderId(riderId: string) {
    return await sql`
    SELECT * FROM deliveries 
      WHERE rider_id = ${riderId}
      ORDER BY created_at DESC
      `;
  },

  async createDelivery(deliveryData: any) {
    return await sql`
      INSERT INTO deliveries(
        order_id, customer_id, pickup_location, delivery_location,
        delivery_fee, commission_rate, commission_amount, rider_earning,
        status, verification_code, confirmation_code
      ) VALUES(
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
    // Transaction to update both delivery and order
    await sql`BEGIN`;
    try {
      // 1. Get Order ID
      const deliveryResult = await sql`SELECT order_id FROM deliveries WHERE id = ${deliveryId}`;
      if (deliveryResult && deliveryResult.length > 0) {
        const orderId = deliveryResult[0].order_id;

        // 2. Update Delivery
        await sql`
            UPDATE deliveries 
            SET status = 'in_transit', picked_up_at = NOW() 
            WHERE id = ${deliveryId}
        `;

        // 3. Update Order Status
        if (orderId) {
          await sql`
                UPDATE orders
                SET status = 'in_transit'
                WHERE id = ${orderId}
            `;
        }
      }
      await sql`COMMIT`;
    } catch (e) {
      await sql`ROLLBACK`;
      throw e;
    }
  },

  async completeDelivery(deliveryId: string, riderId: string, earning: number) {
    // Transaction-like atomic update
    await sql`BEGIN`;
    try {
      // 1. Get Order ID first to ensure we target the right row
      const deliveryResult = await sql`SELECT order_id FROM deliveries WHERE id = ${deliveryId}`;
      if (deliveryResult && deliveryResult.length > 0) {
        const orderId = deliveryResult[0].order_id;

        // 2. Update Delivery
        await sql`
            UPDATE deliveries 
            SET status = 'delivered', delivered_at = NOW() 
            WHERE id = ${deliveryId}
          `;

        // 3. Update Rider Stats
        await sql`
            UPDATE riders 
            SET total_deliveries = total_deliveries + 1,
            total_earnings = total_earnings + ${earning},
            current_balance = current_balance + ${earning}
            WHERE id = ${riderId}
          `;

        // 4. Update Order Status
        if (orderId) {
          await sql`
                UPDATE orders
                SET status = 'delivered'
                WHERE id = ${orderId}
            `;
        }
      }

      await sql`COMMIT`;
      return true;
    } catch (e) {
      await sql`ROLLBACK`;
      throw e;
    }
  },

  async getDeliveryWithRider(orderId: string) {
    const results = await sql`
      SELECT 
       d.id, d.order_id as "orderId", d.customer_id as "customerId",
       d.pickup_location as "pickupLocation", d.delivery_location as "location", d.delivery_location as "deliveryAddress",
       d.delivery_fee as "deliveryFee", d.commission_rate as "commissionRate",
       d.commission_amount as "commissionAmount", d.rider_earning as "riderEarning",
       d.status, d.created_at as "createdAt", d.picked_up_at as "pickedUpAt", d.delivered_at as "deliveredAt",
       d.verification_code as "verificationCode", d.confirmation_code as "customerConfirmationCode",
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
    const users = await sql`SELECT * FROM users WHERE firebase_uid = ${firebaseUid} `;
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
      INSERT INTO users(firebase_uid, email, phone, full_name, role)
    VALUES(
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
    if (updates.full_name) await sql`UPDATE users SET full_name = ${updates.full_name} WHERE id = ${id} `;
    if (updates.phone) await sql`UPDATE users SET phone = ${updates.phone} WHERE id = ${id} `;
    if (updates.email) await sql`UPDATE users SET email = ${updates.email} WHERE id = ${id} `;
  },

  async getAllUsers() {
    return await sql`SELECT * FROM users ORDER BY created_at DESC`;
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
      INSERT INTO menu_items(name, description, price, category, image, is_available)
    VALUES(${item.name}, ${item.description}, ${item.price}, ${item.category}, ${item.image}, ${item.isAvailable ?? true})
    RETURNING *
      `;
  },

  async updateItem(id: string, updates: any) {
    // Simplified update logic to avoid complex dynamic query construction issues
    if (updates.name !== undefined) await sql`UPDATE menu_items SET name = ${updates.name} WHERE id = ${id} `;
    if (updates.description !== undefined) await sql`UPDATE menu_items SET description = ${updates.description} WHERE id = ${id} `;
    if (updates.price !== undefined) await sql`UPDATE menu_items SET price = ${updates.price} WHERE id = ${id} `;
    if (updates.category !== undefined) await sql`UPDATE menu_items SET category = ${updates.category} WHERE id = ${id} `;
    if (updates.image !== undefined) await sql`UPDATE menu_items SET image = ${updates.image} WHERE id = ${id} `;
    if (updates.isAvailable !== undefined) await sql`UPDATE menu_items SET is_available = ${updates.isAvailable} WHERE id = ${id} `;
  },

  async deleteItem(id: string) {
    await sql`DELETE FROM menu_items WHERE id = ${id} `;
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
    await this.ensureTableExists();
    // Verify user exists first? Assuming auth context handles this.
    const [newOrder] = await sql`
      INSERT INTO orders(user_id, items, total_amount, status, delivery_type, delivery_address, payment_method)
    VALUES(
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
    const orders = await sql`SELECT * FROM orders WHERE id = ${orderId} `;
    return orders[0];
  },

  async getAllOrders() {
    try {
      // Join with users to get customer name
      return await sql`
        SELECT 
          o.*, 
          u.full_name as customer_name, 
          u.phone as customer_phone,
          d.verification_code,
          d.confirmation_code
        FROM orders o
        LEFT JOIN users u ON o.user_id::text = u.id::text
        LEFT JOIN deliveries d ON o.id::text = d.order_id::text
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
    await sql`UPDATE orders SET status = ${status} WHERE id = ${orderId} `;
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
    await this.ensureTableExists();
    await sql`
            INSERT INTO reservations (name, email, phone, date, time, guests, table_id, table_name, notes, status)
            VALUES (${data.name}, ${data.email}, ${data.phone}, ${data.date}, ${data.time}, ${data.guests}, ${data.tableId || null}, ${data.tableName || null}, ${data.notes || ''}, 'pending')
        `;
  },

  async getAllReservations() {
    try {
      return await sql`SELECT * FROM reservations ORDER BY created_at DESC`;
    } catch (e: any) {
      if (e.message.includes('relation "reservations" does not exist')) {
        await this.ensureTableExists();
        return [];
      }
      throw e;
    }
  },

  async getReservationsByEmail(email: string) {
    await this.ensureTableExists();
    return await sql`
      SELECT * FROM reservations 
      WHERE email = ${email} 
      ORDER BY date DESC, time DESC
    `;
  },

  async getReservationsByUser(email?: string, phone?: string) {
    await this.ensureTableExists();
    if (!email && !phone) return [];

    return await sql`
      SELECT * FROM reservations 
      WHERE (length(${email || ''}) > 0 AND email = ${email || ''}) 
         OR (length(${phone || ''}) > 0 AND phone = ${phone || ''})
      ORDER BY date DESC, time DESC
    `;
  },

  async acceptReservation(id: string) {
    await this.ensureTableExists();
    await sql`
      UPDATE reservations 
      SET status = 'accepted' 
      WHERE id = ${id}
    `;
  },

  async cancelReservation(id: string) {
    await this.ensureTableExists();
    await sql`
      UPDATE reservations 
      SET status = 'cancelled' 
      WHERE id = ${id}
    `;
  },

  async confirmReservation(id: string) {
    await this.ensureTableExists();
    await sql`
      UPDATE reservations 
      SET status = 'completed' 
      WHERE id = ${id}
    `;
  },

  async markNoShow(id: string) {
    await this.ensureTableExists();
    await sql`
      UPDATE reservations 
      SET status = 'no-show' 
      WHERE id = ${id}
    `;
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
    await this.ensureTableExists();
    return await sql`
      SELECT * FROM locations 
      WHERE active = TRUE 
      ORDER BY name ASC
    `;
  },

  async addLocation(name: string, price: number) {
    await this.ensureTableExists();
    return await sql`
      INSERT INTO locations (name, price)
      VALUES (${name}, ${price})
      RETURNING *
    `;
  },

  async updateLocation(id: string, name: string, price: number) {
    await this.ensureTableExists();
    return await sql`
      UPDATE locations 
      SET name = ${name}, price = ${price}
      WHERE id = ${id}
      RETURNING *
    `;
  },

  async deleteLocation(id: string) {
    await this.ensureTableExists();
    return await sql`
      UPDATE locations 
      SET active = FALSE 
      WHERE id = ${id}
    `;
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

