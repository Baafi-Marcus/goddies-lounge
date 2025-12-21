import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

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

  async acceptDeliveryOffer(deliveryId: string, riderId: string) {
    const { data } = await api.patch('/deliveries', {
      action: 'accept_offer',
      deliveryId,
      riderId
    });
    return data;
  },

  async cancelDelivery(deliveryId: string, reason: string) {
    const { data } = await api.patch('/deliveries', {
      action: 'cancel',
      deliveryId,
      reason
    });
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
  },

  async confirmDeliveryReceipt(orderId: string, code: string) {
    const { data } = await api.patch('/deliveries', { action: 'user_confirm', orderId, code });
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
    // Schema is handled by server-side setup
    return;
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
        if (typeof data === 'string') {
          console.error('Response snippet:', data.substring(0, 200));
        }
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
    return;
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
    return;
  },

  async getLayout() {
    const { data } = await api.get('/tables');
    return data.map((row: any) => ({
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
  },

  async saveLayout(tables: any[]) {
    await api.post('/tables', { tables });
    return true;
  }
};

export const ReservationService = {
  async ensureTableExists() {
    return;
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
    const { data } = await api.get('/reservations', {
      params: {
        email: email || '',
        phone: phone || ''
      }
    });
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
    return;
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
    // Cleanup logic moved to server-side if needed
    // In production, we should avoid running this from frontend
    return;
  }
};

