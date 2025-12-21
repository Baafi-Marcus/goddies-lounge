# Delivery Cancellation Feature

## Overview
This feature allows riders to cancel deliveries with a reason, and enables both admins and users to view why a delivery was cancelled.

## Database Setup

### Step 1: Run Migration
Execute the SQL migration in your Neon database console:

```bash
# The migration file is located at:
migrations/add_delivery_cancellation_tracking.sql
```

Copy and paste the SQL from that file into your Neon SQL Editor and run it.

### What the Migration Does
- Adds `cancellation_reason` column to store the rider's reason
- Adds `cancelled_at` timestamp for when cancellation occurred  
- Adds `cancelled_by_rider_id` to track which rider cancelled
- Creates an index for faster queries on cancelled deliveries

## How It Works

### Rider Cancels Delivery
1. Rider clicks "Cancel" button on active delivery
2. Modal appears requiring a cancellation reason
3. Reason is submitted to API
4. **Delivery status** → `cancelled`
5. **Order status** → `ready` (NOT cancelled!)
6. Cancellation details stored in database

### Admin Can Reassign
- Order appears back in "Ready" status in ManageOrders
- Admin can click "Assign Rider" to send to a different rider
- Previous cancelled delivery remains in history

### Viewing Cancellation Reasons

**Admin (ManageDeliveries page):**
- Cancelled deliveries show a warning badge
- Cancellation reason displayed below delivery details
- Shows which rider cancelled and when

**User (OrderTracking page):**
- If delivery was cancelled, user sees:
  - "Delivery Cancelled" status
  - Reason for cancellation
  - Message that a new rider will be assigned

## API Endpoint

### Cancel Delivery
```typescript
PATCH /api/deliveries
{
  "action": "cancel",
  "deliveryId": "uuid",
  "reason": "Vehicle breakdown"
}
```

**Response:**
- Delivery marked as cancelled with reason stored
- Order set back to 'ready' for reassignment

## Database Schema

```sql
deliveries table:
- cancellation_reason: TEXT (nullable)
- cancelled_at: TIMESTAMP (nullable)
- cancelled_by_rider_id: UUID (nullable, references riders.id)
```

## Testing

1. **Create an order** as a user
2. **Assign to rider** as admin
3. **Accept delivery** as rider
4. **Cancel with reason** as rider (e.g., "Vehicle breakdown")
5. **Verify**:
   - Order is back in "Ready" status (admin view)
   - Cancellation reason is visible (admin & user view)
   - Admin can reassign to different rider

## Future Enhancements

- Analytics dashboard for cancellation reasons
- Rider performance tracking based on cancellation rate
- Automatic rider suggestions based on cancellation history
- Push notifications when delivery is cancelled
