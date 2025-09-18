# Hotel System - Standardized Login Credentials

## Overview
All hotel staff accounts have been standardized with the password **"password"** for testing purposes.

## 🔒 System Admin Credentials

### **Cross-Tenant System Administrators**
| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| `admin@bookmyhotel.com` | `password` | ADMIN | **ALL tenants, hotels, users** |
| `admin2@bookmyhotel.com` | `password123` | ADMIN | **ALL tenants, hotels, users** |

**Note:** System admins have `tenant_id = NULL` and can access ALL data across ALL tenants.

---

## Hotel Login Credentials

### Hotel ID 1: Grand Plaza Hotel
- **Domain**: @grandplaza.com
- **Hotel Admin**: hotel.admin@grandplaza.com / password
- **Front Desk**: frontdesk@grandplaza.com / password  
- **Housekeeping**: housekeeping@grandplaza.com / password
- **Maintenance**: maintenance@grandplaza.com / password

### Hotel ID 2: Grand Test Hotel  
- **Domain**: @grandtesthotel.com
- **Hotel Admin**: hoteladmin@grandtesthotel.com / password
- **Front Desk**: frontdesk@grandtesthotel.com / password
- **Housekeeping**: housekeeping@grandtesthotel.com / password
- **Maintenance**: maintenance@grandtesthotel.com / password

### Hotel ID 3: MyHotel test
- **Domain**: @myhoteltest.com
- **Hotel Admin**: hoteladmin@myhoteltest.com / password
- **Front Desk**: frontdesk@myhoteltest.com / password
- **Housekeeping**: housekeeping@myhoteltest.com / password
- **Maintenance**: maintenance@myhoteltest.com / password

### Hotel ID 4: Test Grand Hotel
- **Domain**: @testgrandhotel.com
- **Hotel Admin**: hoteladmin@testgrandhotel.com / password
- **Front Desk**: frontdesk@testgrandhotel.com / password
- **Housekeeping**: housekeeping@testgrandhotel.com / password
- **Maintenance**: maintenance@testgrandhotel.com / password

### Hotel ID 5: Sunshine Family Resort
- **Domain**: @sunshineresort.com
- **Hotel Admin**: hoteladmin@sunshineresort.com / password
- **Front Desk**: frontdesk@sunshineresort.com / password
- **Housekeeping**: housekeeping@sunshineresort.com / password
- **Maintenance**: maintenance@sunshineresort.com / password

### Hotel ID 6: Grand Luxury Resort & Spa
- **Domain**: @grandluxuryresort.com
- **Hotel Admin**: hoteladmin@grandluxuryresort.com / password
- **Front Desk**: frontdesk@grandluxuryresort.com / password
- **Housekeeping**: housekeeping@grandluxuryresort.com / password
- **Maintenance**: maintenance@grandluxuryresort.com / password

### Hotel ID 7: Metropolitan Business Hotel
- **Domain**: @metrobusinesshotel.com
- **Hotel Admin**: hoteladmin@metrobusinesshotel.com / password
- **Front Desk**: frontdesk@metrobusinesshotel.com / password
- **Housekeeping**: housekeeping@metrobusinesshotel.com / password
- **Maintenance**: maintenance@metrobusinesshotel.com / password

### Hotel ID 8: The Maritime Grand Hotel
- **Domain**: @maritimegrand.com
- **Hotel Admin**: admin@maritimegrand.com / password (existing)
- **Front Desk**: frontdesk@maritimegrand.com / password
- **Housekeeping**: housekeeping@maritimegrand.com / password
- **Maintenance**: maintenance@maritimegrand.com / password

### Hotel ID 9: Urban Business Hub
- **Domain**: @urbanbusinesshub.com
- **Hotel Admin**: admin@urbanbusinesshub.com / password (existing)
- **Front Desk**: frontdesk@urbanbusinesshub.com / password
- **Housekeeping**: housekeeping@urbanbusinesshub.com / password
- **Maintenance**: maintenance@urbanbusinesshub.com / password

### Hotel ID 10: The Maritime Grand Hotel (Instance 2)
- **Domain**: @maritimegrand.com
- **Hotel Admin**: hoteladmin.10@maritimegrand.com / password
- **Front Desk**: frontdesk.10@maritimegrand.com / password
- **Housekeeping**: housekeeping.10@maritimegrand.com / password
- **Maintenance**: maintenance.10@maritimegrand.com / password

### Hotel ID 11: Urban Business Hub (Instance 2)
- **Domain**: @urbanbusinesshub.com
- **Hotel Admin**: hoteladmin.11@urbanbusinesshub.com / password
- **Front Desk**: frontdesk.11@urbanbusinesshub.com / password
- **Housekeeping**: housekeeping.11@urbanbusinesshub.com / password
- **Maintenance**: maintenance.11@urbanbusinesshub.com / password

### Hotel ID 12: Addis Sunshine Hotel
- **Domain**: @addissunshine.com
- **Hotel Admin**: bookmyhotel2025+newhotel001@gmail.com / password (existing)
- **Front Desk**: bookmyhotel2025+newhotelfd001@gmail.com / password (existing)
- **Additional standard accounts to be added if needed**

### Hotel ID 13: Global International Hotel
- **Domain**: @globalhotel.co.uk
- **Hotel Admin**: hoteladmin@globalhotel.co.uk / password
- **Front Desk**: frontdesk@globalhotel.co.uk / password
- **Housekeeping**: housekeeping@globalhotel.co.uk / password
- **Maintenance**: maintenance@globalhotel.co.uk / password

## Room Data Summary

All hotels now have comprehensive room data:

| Hotel ID | Hotel Name | Room Count | Room Types Available |
|----------|------------|------------|---------------------|
| 1 | Grand Plaza Hotel | 7 | DOUBLE, PRESIDENTIAL, SINGLE, SUITE |
| 2 | Grand Test Hotel | 5 | DOUBLE, SINGLE, SUITE |
| 3 | MyHotel test | 5 | DOUBLE, SINGLE, SUITE |
| 4 | Test Grand Hotel | 7 | DELUXE, DOUBLE, SINGLE, SUITE |
| 5 | Sunshine Family Resort | 10 | DELUXE, DOUBLE, SINGLE, SUITE |
| 6 | Grand Luxury Resort & Spa | 10 | DELUXE, DOUBLE, PRESIDENTIAL, SINGLE, SUITE |
| 7 | Metropolitan Business Hotel | 10 | DELUXE, DOUBLE, SINGLE, SUITE |
| 8 | The Maritime Grand Hotel | 10 | DELUXE, PRESIDENTIAL, SINGLE, SUITE |
| 9 | Urban Business Hub | 10 | DELUXE, DOUBLE, SINGLE, SUITE |
| 10 | The Maritime Grand Hotel | 9 | DELUXE, PRESIDENTIAL, SINGLE, SUITE |
| 11 | Urban Business Hub | 10 | DELUXE, DOUBLE, SINGLE, SUITE |
| 12 | Addis Sunshine Hotel | 8 | DOUBLE, SINGLE, SUITE |
| 13 | Global International Hotel | 9 | DELUXE, DOUBLE, PRESIDENTIAL, SINGLE, SUITE |

## Room Pricing

Each hotel has appropriate room type pricing configured based on their market positioning:

- **Budget Hotels** (Addis Sunshine): $85-200
- **Mid-Range Hotels** (MyHotel test, Grand Test): $110-300  
- **Business Hotels** (Metropolitan, Urban Business Hub): $140-320
- **Resort Hotels** (Sunshine Family): $150-380
- **Luxury Hotels** (Grand Luxury Resort): $250-800
- **International Hotels** (Global International): £180-750

## Notes

- All existing user passwords have been updated to "password"
- Hotels 8, 9, and 12 had existing users that were preserved
- Hotels 10 and 11 are duplicates with unique user accounts (using .10 and .11 suffixes)
- Room type pricing is configured for all room types in each hotel
- All rooms are in "AVAILABLE" status except for specific test cases in Grand Plaza Hotel

## Testing

You can test any of these credentials by logging into the system at:
- Frontend: http://localhost:3000
- API Login Endpoint: POST http://localhost:8080/api/auth/login

Example login payload:
```json
{
  "email": "hoteladmin@grandtesthotel.com",
  "password": "password"
}
```
