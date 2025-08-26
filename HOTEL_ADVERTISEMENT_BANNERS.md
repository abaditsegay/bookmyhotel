# Hotel Advertisement Banners Implementation

## Overview
This implementation provides multiple hotel advertisement panes that display random hotels from the database with automatic refresh functionality.

## Components

### 1. HotelAdvertisementBanner (Horizontal)
- **Location**: Top and bottom of the home page
- **Layout**: Horizontal scrollable cards
- **Usage**: 
  - Top: Integrated within the main search area
  - Bottom: Full-width section at the bottom of the page
- **Refresh**: Every 2 minutes (120 seconds)
- **Features**:
  - Displays 5-6 random hotels per refresh
  - Scrollable horizontal layout with smooth hover effects
  - Hotel cards show: name, location, description, pricing, and CTA button
  - Responsive design with proper card sizing

### 2. VerticalHotelAdvertisementBanner (Sidebar)
- **Location**: Right sidebar on desktop (hidden on mobile)
- **Layout**: Vertical stacked cards
- **Usage**: Sticky sidebar that stays visible while scrolling
- **Refresh**: Every 2 minutes (120 seconds)
- **Features**:
  - Displays 3-4 random hotels per refresh
  - Compact vertical cards optimized for sidebar
  - Scrollable if content exceeds container height
  - Same hotel information but in a more compact format

## API Endpoint
- **URL**: `GET /api/hotels/random`
- **Type**: Public endpoint (no authentication required)
- **Response**: Array of HotelSearchResult objects
- **Backend Logic**: Uses `ORDER BY RAND() LIMIT 5` to select random active hotels

## User Experience Features
- **Auto-refresh**: Both components refresh independently every 2 minutes
- **Fallback Data**: If API fails, components show predefined sample hotels
- **Loading States**: Skeleton loaders while fetching data
- **Error Handling**: Graceful fallback with user-friendly messages
- **User Filtering**: Hidden for operations users (maintenance, housekeeping, etc.)
- **Responsive Design**: Horizontal banners stack on mobile, sidebar hidden on small screens

## Technical Implementation
- **Frontend**: React TypeScript components with Material-UI
- **Backend**: Spring Boot with MySQL database
- **Data Refresh**: Uses `setInterval` with cleanup on component unmount
- **State Management**: React hooks (useState, useEffect, useCallback)
- **API Integration**: Dedicated service methods in hotelApi.ts

## Layout Integration
```
┌─────────────────────────────────────┬─────────────────┐
│ Main Content Area                   │ Right Sidebar   │
│ ┌─────────────────────────────────┐ │ ┌─────────────┐ │
│ │ Top Horizontal Banner           │ │ │ Vertical    │ │
│ │ (HotelAdvertisementBanner)      │ │ │ Banner      │ │
│ └─────────────────────────────────┘ │ │ (Sticky)    │ │
│                                     │ │             │ │
│ Hotel Search Form & Results         │ │             │ │
│                                     │ │             │ │
└─────────────────────────────────────┴─┴─────────────┘
│                                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Bottom Horizontal Banner                        │ │
│ │ (HotelAdvertisementBanner)                      │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Refresh Behavior
- All components refresh simultaneously every 2 minutes
- Each component may show different random hotels
- Refresh continues automatically while user is on the page
- Components start fetching immediately on page load
