# BookMyHotel Mobile App

A React Native mobile application for hotel search and anonymous booking, built with Expo.

## Overview

The BookMyHotel mobile app provides a streamlined interface for users to:
- Search for hotels by destination, dates, and guest count
- View detailed hotel information including rooms and amenities
- Make anonymous bookings without creating an account
- Look up existing bookings using booking reference and email

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6 (Stack and Bottom Tab Navigation)
- **API Client**: Axios with interceptors
- **Local Storage**: AsyncStorage
- **Icons**: Expo Vector Icons (Ionicons)
- **Date Handling**: date-fns
- **Backend**: Existing Spring Boot API (BookMyHotel backend)

## Project Structure

```
mobile/
├── src/
│   ├── components/
│   │   └── common/           # Reusable UI components
│   │       ├── Button.js
│   │       ├── Input.js
│   │       ├── Card.js
│   │       ├── LoadingSpinner.js
│   │       └── index.js
│   ├── constants/
│   │   └── config.js         # App configuration and constants
│   ├── navigation/
│   │   └── AppNavigator.js   # Navigation setup
│   ├── screens/              # Screen components (Phase 2)
│   ├── services/
│   │   ├── api.js           # Base API configuration
│   │   ├── hotelService.js  # Hotel-related API calls
│   │   └── bookingService.js # Booking-related API calls
│   ├── styles/
│   │   └── globalStyles.js  # Global styles, colors, typography
│   └── utils/
│       ├── storage.js       # AsyncStorage utilities
│       ├── validation.js    # Form validation functions
│       └── dateUtils.js     # Date manipulation utilities
├── App.js                   # Main app component
├── package.json
└── README.md
```

## Current Status: Phase 1 Complete ✅

### Completed Features:

1. **Project Setup**
   - ✅ Expo React Native project created
   - ✅ All dependencies installed
   - ✅ Folder structure established

2. **Core Infrastructure**
   - ✅ API configuration with dev/prod environments
   - ✅ Axios setup with interceptors and error handling
   - ✅ Hotel service for search and details API calls
   - ✅ Booking service for anonymous booking functionality
   - ✅ AsyncStorage utilities for local data persistence
   - ✅ Form validation utilities
   - ✅ Date manipulation utilities

3. **UI Foundation**
   - ✅ Global styles with comprehensive color palette
   - ✅ Typography and spacing system
   - ✅ Reusable UI components (Button, Input, Card, LoadingSpinner)
   - ✅ Navigation setup with tab and stack navigators
   - ✅ Placeholder screens for development

4. **Navigation Structure**
   - ✅ Bottom tab navigation for main screens (Home, Search, Bookings)
   - ✅ Stack navigation for detailed views and booking flow
   - ✅ Proper screen transitions and header configurations

## Installation & Setup

1. **Prerequisites**
   - Node.js (v14 or higher)
   - Expo CLI: `npm install -g expo-cli`
   - iOS Simulator (for iOS development) or Android Studio (for Android)

2. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

3. **Environment Setup**
   - Ensure the backend server is running
   - Update API endpoints in `src/constants/config.js` if needed

4. **Run the App**
   ```bash
   # Start the Expo development server
   npm start
   
   # Or run on specific platform
   npm run ios     # iOS simulator
   npm run android # Android emulator
   npm run web     # Web browser
   ```

## API Integration

The mobile app connects to the existing BookMyHotel Spring Boot backend:

### Hotel Service Endpoints:
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/{id}` - Get hotel details
- `GET /api/hotels/{id}/rooms` - Get hotel rooms
- `GET /api/destinations` - Get available destinations

### Booking Service Endpoints:
- `POST /api/bookings/anonymous` - Create anonymous booking
- `GET /api/bookings/{reference}/confirmation` - Get booking confirmation
- `GET /api/bookings/lookup` - Lookup booking by reference and email

## Components

### Common Components

1. **Button** - Versatile button component with multiple variants:
   - Primary, secondary, outline, and text variants
   - Small, medium, and large sizes
   - Loading and disabled states
   - Custom styling support

2. **Input** - Text input component with validation:
   - Label and error message support
   - Left and right icon slots
   - Focus and error states
   - Multiline support

3. **Card** - Container component for content:
   - Optional title and subtitle
   - Tap functionality
   - Customizable elevation/shadows
   - Flexible content styling

4. **LoadingSpinner** - Loading indicator:
   - Customizable size and color
   - Optional loading text
   - Centered layout

## Development Phases

### Phase 1: Core Infrastructure ✅ (COMPLETED)
- [x] Project setup and dependencies
- [x] API services and utilities
- [x] Navigation setup
- [x] Basic UI components
- [x] Global styles and theming

### Phase 2: Screen Development (NEXT)
- [ ] HomeScreen with featured hotels
- [ ] SearchScreen with filters
- [ ] HotelDetailsScreen with rooms
- [ ] BookingScreen with guest information
- [ ] BookingConfirmationScreen
- [ ] BookingLookupScreen

### Phase 3: Enhanced Features
- [ ] Image handling and optimization
- [ ] Error handling and retry mechanisms
- [ ] Offline support
- [ ] Push notifications
- [ ] Performance optimizations

### Phase 4: Polish & Testing
- [ ] Comprehensive testing
- [ ] Accessibility improvements
- [ ] Animation and micro-interactions
- [ ] App store preparation

## Configuration

### API Configuration (`src/constants/config.js`)
```javascript
const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:8080/api'  // Development
    : 'https://your-api.com/api',  // Production
  TIMEOUT: 10000,
};
```

### Storage Keys
- `RECENT_SEARCHES` - User's recent hotel searches
- `USER_PREFERENCES` - App preferences and settings
- `BOOKING_DRAFTS` - Incomplete booking forms

## Styling System

### Colors
- Primary: #1976d2 (Blue)
- Secondary: #ff9800 (Orange)
- Success: #4caf50 (Green)
- Error: #f44336 (Red)
- Background: #fafafa (Light Gray)

### Typography
- Font sizes: xs(12) to xxxl(28)
- Font weights: light(300) to bold(700)
- Line heights: tight(1.2) to loose(1.8)

### Spacing
- Scale: xs(4) to xxxl(64)
- Consistent spacing throughout the app

## Next Steps

To continue development with Phase 2:

1. **Start Backend Server**
   ```bash
   # In the main project directory
   npm run start:mysql  # Start database
   npm run start:backend # Start Spring Boot API
   ```

2. **Begin Screen Development**
   - Implement HomeScreen with hotel recommendations
   - Create SearchScreen with destination and date inputs
   - Build HotelDetailsScreen with room listings
   - Develop booking flow screens

3. **Test API Integration**
   - Verify hotel search functionality
   - Test anonymous booking flow
   - Validate booking lookup feature

## Contributing

When adding new features:
1. Follow the established folder structure
2. Use the global styles and components
3. Maintain consistent API service patterns
4. Add proper error handling
5. Update this README with changes

## Troubleshooting

### Common Issues:

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS simulator not opening**
   ```bash
   npx expo run:ios
   ```

3. **Android emulator issues**
   ```bash
   npx expo run:android
   ```

4. **API connection issues**
   - Check backend server is running
   - Verify API endpoints in config.js
   - Check device/simulator network connection

---

**Ready for Phase 2 Development!** 🚀

The core infrastructure is complete and the app is ready for screen implementation.
