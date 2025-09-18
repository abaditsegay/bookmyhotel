# Anonymous Sales Feature Documentation

## Overview
The shopping section now supports anonymous sales, allowing staff to process orders without requiring customer details.

## Changes Made

### Backend Changes

#### 1. ShopOrderRequest.java
- **Location**: `/backend/src/main/java/com/bookmyhotel/dto/ShopOrderRequest.java`
- **Changes**: Removed `@NotNull` and `@NotBlank` validation annotations from `customerName`
- **Impact**: Customer name is now optional for order creation

#### 2. ShopOrder.java
- **Location**: `/backend/src/main/java/com/bookmyhotel/entity/ShopOrder.java`
- **Changes**: Removed `@NotBlank` validation from `customerName` field
- **Impact**: Database allows null customer names

### Frontend Changes

#### 3. OrderCreation.tsx
- **Location**: `/frontend/src/components/shop/OrderCreation.tsx`
- **Changes**: Updated `handleCreateOrder` function to support anonymous sales
- **Key Features**:
  - Sets `customerName`, `customerEmail`, `customerPhone` to `undefined` for anonymous orders
  - Maintains "Anonymous Sale" and "Charge to Room" functionality
  - Proper error handling and validation

#### 4. TypeScript Interfaces
- **Location**: `/frontend/src/types/shop.ts`
- **Status**: Already had optional customer fields (`customerName?`, `customerEmail?`, `customerPhone?`)
- **Impact**: Type safety maintained while supporting optional fields

## How to Use Anonymous Sales

### 1. Access the Shopping Section
- Navigate to the shopping/POS section in the application
- Login with appropriate staff credentials

### 2. Create Anonymous Orders
- Add products to the cart using the product catalog
- In the order creation section:
  - **Anonymous Sale**: Leave customer fields empty, process as cash/card payment
  - **Charge to Room**: Enter room number, charge will be added to guest's bill

### 3. Order Processing
- Select payment method (Cash, Card, Room Charge)
- Add any special notes if needed
- Submit the order

## Technical Implementation

### Backend Validation
```java
// Before: Required customer name
@NotNull
@NotBlank
private String customerName;

// After: Optional customer name
private String customerName;
```

### Frontend Order Creation
```typescript
const orderData: ShopOrderCreateRequest = {
  customerName: undefined,        // Anonymous sale
  customerEmail: undefined,
  customerPhone: undefined,
  roomNumber: roomNumber.trim() || undefined,
  // ... rest of order data
};
```

### Database Schema
- `shop_orders.customer_name` can now be `NULL`
- Existing orders with customer names remain unchanged
- New anonymous orders will have `NULL` customer names

## Benefits

1. **Faster Service**: No need to collect customer details for quick purchases
2. **Walk-in Sales**: Support for anonymous customers who don't want to provide details
3. **Flexibility**: Staff can choose when customer details are necessary
4. **Room Charges**: Maintain ability to charge purchases to specific rooms

## Backwards Compatibility

- Existing functionality with customer details still works
- Orders with customer information continue to work as before
- No breaking changes to existing APIs
- Database supports both null and non-null customer names

## Testing

### Manual Testing Steps
1. Start the application (backend on :8080, frontend on :3000)
2. Login as staff user
3. Navigate to shopping section
4. Add products to cart
5. Create order without filling customer details
6. Verify order is created successfully
7. Check that order displays "Anonymous Customer" in management interfaces

### API Testing
```bash
# Create anonymous order
curl -X POST http://localhost:8080/api/shop/{hotelId}/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "customerName": null,
    "customerEmail": null,
    "customerPhone": null,
    "paymentMethod": "CASH",
    "isDelivery": false,
    "deliveryType": "NONE",
    "items": [...]
  }'
```

## Future Enhancements

1. **Anonymous Customer Display**: Show "Anonymous Customer" in order management
2. **Analytics**: Track anonymous vs named customer sales
3. **Partial Information**: Allow some customer details without requiring all
4. **Guest Recognition**: Option to lookup returning anonymous customers

## Troubleshooting

### Common Issues
1. **Validation Errors**: Ensure all required fields except customer details are provided
2. **Frontend Compilation**: Customer-related variables should be optional or undefined
3. **Database Constraints**: Verify customer_name column allows NULL values

### Support
- Check application logs for detailed error messages
- Verify database schema allows NULL customer names
- Ensure frontend and backend are synchronized on optional field handling
