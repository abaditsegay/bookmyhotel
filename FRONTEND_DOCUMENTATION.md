# BookMyHotel — Frontend Documentation

## Overview

The frontend is a React 18 single-page application written in TypeScript. It uses Material UI (MUI 5) for the component library, React Router v6 for routing, and i18next for internationalization (English, Amharic, Afan Oromo). The app is built with Create React App and deployed as static files served by Nginx on AWS Lightsail.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 4.9 | Type safety |
| Material UI (MUI) | 5.16 | Component library |
| React Router | 6.25 | Client-side routing |
| i18next | 25.x | Internationalization |
| Axios | 1.11 | HTTP client |
| React Query (TanStack) | 5.x | Server state management |
| Stripe.js | 4.x | Payment integration |
| Day.js / date-fns | — | Date handling |
| notistack | 3.x | Snackbar notifications |
| Playwright | 1.55 | End-to-end testing |

---

## Project Structure

```
frontend/
├── public/                     # Static assets, index.html, PWA manifest
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── admin/              # System admin components
│   │   ├── booking/            # Booking flow components
│   │   ├── common/             # Shared components (ErrorBoundary, NotificationProvider, etc.)
│   │   ├── debug/              # Debug utilities
│   │   ├── demo/               # Demo pages
│   │   ├── frontdesk/          # Front desk components
│   │   ├── hotel/              # Hotel display components
│   │   ├── hotel-admin/        # Hotel admin components
│   │   ├── layout/             # EnhancedLayout, navigation, sidebar
│   │   ├── operations/         # Operations dashboard components
│   │   ├── receipts/           # Receipt/PDF components
│   │   ├── revenue/            # Revenue management components
│   │   ├── shop/               # Hotel shop components
│   │   ├── ui/                 # Low-level UI primitives
│   │   ├── Housekeeping/       # Housekeeping components
│   │   ├── Staff/              # Staff management components
│   │   └── Supervisor/         # Supervisor components
│   ├── config/                 # API and security configuration
│   │   ├── apiConfig.ts        # API base URL, endpoints
│   │   └── securityConfig.ts   # Security settings
│   ├── constants/              # Shared constants (room types, etc.)
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx      # Authentication state, login/logout, JWT management
│   │   ├── TenantContext.tsx    # Multi-tenant context
│   │   ├── ThemeContext.tsx     # Theme switching
│   │   ├── LoadingContext.tsx   # Global loading state
│   │   ├── NotificationContext.tsx  # Notification management
│   │   └── OperationsContext.tsx    # Operations dashboard state
│   ├── data/                   # Static data
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuthenticatedApi.ts   # Authenticated API calls
│   │   ├── useBookingHistory.ts     # Booking history management
│   │   ├── useBookingNotifications.ts # Real-time notifications
│   │   ├── useCsvExport.ts          # CSV export utility
│   │   ├── useDebounce.ts           # Input debouncing
│   │   ├── useFormValidation.ts     # Form validation
│   │   ├── useNetworkStatus.ts      # Online/offline detection
│   │   ├── useNotification.ts       # Toast notifications
│   │   ├── usePaginationSettings.ts # Table pagination
│   │   ├── useResponsive.ts         # Responsive breakpoints
│   │   └── useTableSort.ts          # Table sorting
│   ├── i18n/                   # Internationalization
│   │   ├── index.ts            # i18next configuration
│   │   └── locales/            # Translation files (en, am, om)
│   ├── modules/                # Route module groupings (lazy-loaded)
│   │   ├── AdminModule.tsx
│   │   ├── FrontDeskModule.tsx
│   │   ├── HotelAdminModule.tsx
│   │   ├── HousekeepingModule.tsx
│   │   ├── OperationsModule.tsx
│   │   ├── PublicModule.tsx
│   │   ├── ShopModule.tsx
│   │   ├── StaffModule.tsx
│   │   └── SystemModule.tsx
│   ├── pages/                  # Page-level components
│   │   ├── admin/              # System admin pages
│   │   ├── frontdesk/          # Front desk pages
│   │   ├── hotel-admin/        # Hotel admin pages
│   │   ├── housekeeping/       # Housekeeping pages
│   │   ├── operations/         # Operations supervisor pages
│   │   ├── shop/               # Hotel shop pages
│   │   ├── LoginPage.tsx
│   │   ├── BookingPage.tsx
│   │   ├── HotelSearchPage.tsx
│   │   └── ...                 # Other page components
│   ├── services/               # API service layer
│   │   ├── bookingApi.ts       # Booking CRUD operations
│   │   ├── hotelApi.ts         # Hotel queries
│   │   ├── adminApi.ts         # System admin operations
│   │   ├── hotelAdminApi.ts    # Hotel admin operations
│   │   ├── frontDeskApi.ts     # Front desk operations
│   │   ├── shopApi.ts          # Shop order management
│   │   ├── operationsApi.ts    # Operations dashboard API
│   │   ├── staffApi.ts         # Staff scheduling API
│   │   ├── tenantApi.ts        # Tenant management API
│   │   ├── systemUserApi.ts    # System user management
│   │   ├── roomChargeApi.ts    # Room charge tracking
│   │   ├── OfflineStorageService.ts  # IndexedDB offline caching
│   │   ├── RoomCacheService.ts       # Room data cache
│   │   ├── SyncManager.ts            # Offline sync manager
│   │   └── ...
│   ├── theme/                  # MUI theme configuration
│   │   ├── theme.ts            # Primary theme definition
│   │   ├── themes.ts           # Theme variants
│   │   ├── colorConstants.ts   # Color palette
│   │   ├── designSystem.ts     # Design tokens
│   │   └── themeColors.ts      # Role-based theme colors
│   ├── types/                  # TypeScript type definitions
│   │   ├── booking.ts
│   │   ├── hotel.ts
│   │   ├── shop.ts
│   │   ├── operations.ts
│   │   └── monitoring.ts
│   ├── utils/                  # Utility functions
│   │   ├── apiClient.ts        # HTTP client with auth interceptors
│   │   ├── tokenManager.ts     # JWT token storage/refresh
│   │   ├── currencyUtils.ts    # ETB currency formatting
│   │   ├── dateUtils.ts        # Date formatting helpers
│   │   ├── phoneUtils.ts       # Ethiopian phone validation
│   │   ├── errorHandler.ts     # Centralized error handling
│   │   └── ...
│   ├── App.tsx                 # Root app with routing
│   └── index.tsx               # Entry point
├── e2e/                        # Playwright E2E test specs
├── playwright.config.ts        # Playwright configuration
└── package.json
```

---

## Authentication Flow

1. User submits credentials on `LoginPage`.
2. `AuthContext` calls the backend `/api/auth/login` endpoint.
3. On success, a JWT token and user object are stored via `TokenManager` in localStorage.
4. `apiClient.ts` attaches the `Authorization: Bearer <token>` header to all subsequent requests.
5. On 401 response, the session expiration callback silently logs the user out and redirects to login.
6. Role-based routing (`RoleBasedRouter` in `App.tsx`) redirects authenticated users to their dashboard.

### Supported Roles

| Role | Dashboard Route |
|---|---|
| SYSTEM_ADMIN | `/system-dashboard` |
| HOTEL_ADMIN | `/hotel-admin/dashboard` |
| ADMIN (tenant-bound) | `/admin/dashboard` |
| FRONTDESK | `/frontdesk/dashboard` |
| OPERATIONS_SUPERVISOR | `/operations/dashboard` |
| HOUSEKEEPING / MAINTENANCE | `/staff/dashboard` |
| Guest (unauthenticated) | `/hotels/search` |

---

## Multi-Tenancy

- `TenantContext` holds the current tenant ID derived from the logged-in user's `tenantId`.
- All API calls from tenant-bound users include tenant context via request headers.
- System-wide users (SYSTEM_ADMIN) can view and manage all tenants.

---

## Internationalization (i18n)

- Supported languages: English (`en`), Amharic (`am`), Afan Oromo (`om`)
- Translation files in `src/i18n/locales/`
- Language detection via `i18next-browser-languagedetector`
- All UI strings use `t()` translation function from `react-i18next`

---

## Offline Support

- `OfflineStorageService` uses IndexedDB for caching staff sessions and booking data.
- `RoomCacheService` periodically refreshes room data for front desk offline use.
- `SyncManager` handles syncing offline-created bookings when connectivity is restored.
- `useNetworkStatus` hook detects online/offline state.

---

## Key Features by Module

### Public Module
- Hotel search and browsing
- Hotel details with room types and images
- Online booking with Stripe payment
- Booking confirmation and receipt
- Guest authentication and booking management
- Public hotel registration

### Front Desk Module
- Walk-in booking creation
- Check-in / check-out management
- Room status overview
- Room charge tracking
- Booking modification and cancellation
- Receipt printing (PDF)

### Hotel Admin Module
- Room management (CRUD, bulk upload)
- Staff management
- Booking oversight
- Pricing configuration
- Revenue reports

### System Admin Module
- Tenant management
- Hotel registration approval
- User management (system-wide)
- System monitoring dashboard

### Operations Module
- Operations supervisor dashboard
- Housekeeping task management
- Maintenance request tracking
- Staff scheduling

### Shop Module
- Product inventory management
- Shop order processing
- Tax configuration
- Sales dashboard

---

## Build & Deployment

### Local Development
```bash
cd frontend
npm install --legacy-peer-deps
npm start                     # Starts dev server on http://localhost:3000
```

### Production Build
```bash
cd frontend
npm run build                 # Outputs to frontend/build/
```

### Deployment to AWS Lightsail
```bash
# From project root
bash deploy-frontend.sh       # Builds, packages, uploads, and deploys to Nginx
```
- Target: `44.204.49.94`
- Nginx serves static files from `/var/www/bookmyhotel`

### E2E Testing
```bash
cd frontend
npx playwright test           # Run all tests
npx playwright test --ui      # Interactive test runner
```

---

## Environment Configuration

The API base URL is configured in `src/config/apiConfig.ts`. The app detects the environment (localhost vs production) and routes API calls accordingly.

---

## Code Conventions

- Functional components with React hooks
- Lazy loading for all page-level components (`React.lazy` + `Suspense`)
- Error boundaries at multiple levels (critical, page)
- Centralized API client with automatic token management
- MUI `sx` prop for styling; shared design tokens in `theme/`
- Custom hooks for reusable logic
- Module-based route organization for code splitting
