import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
const HotelSearchPage = lazy(() => import('../pages/HotelSearchPage'));
const SearchResultsPage = lazy(() => import('../pages/SearchResultsPage'));
const HotelListPage = lazy(() => import('../pages/HotelListPage'));
const HotelDetailPage = lazy(() => import('../pages/HotelDetailPage'));
const BookingPage = lazy(() => import('../pages/BookingPage'));
const BookingConfirmationPage = lazy(() => import('../pages/BookingConfirmationPage'));
const FindBookingPage = lazy(() => import('../pages/FindBookingPage'));
const BookingSearchPage = lazy(() => import('../pages/BookingSearchPage'));
const BookingManagementPage = lazy(() => import('../pages/BookingManagementPage'));
const GuestBookingManagementPage = lazy(() => import('../pages/GuestBookingManagementPage'));

/**
 * Public Module - Guest-facing routes
 * These match the existing top-level paths for backward compatibility
 */
const PublicModule: React.FC = () => {
  return (
    <Routes>
      <Route path="home" element={<HotelSearchPage />} />
      <Route path="hotels/search" element={<HotelSearchPage />} />
      <Route path="hotels/search-results" element={<HotelListPage />} />
      <Route path="hotels/:hotelId" element={<HotelDetailPage />} />
      <Route path="search-results" element={<SearchResultsPage />} />
      <Route path="find-booking" element={<FindBookingPage />} />
      <Route path="booking" element={<BookingPage />} />
      <Route path="booking-confirmation/:reservationId" element={<BookingConfirmationPage />} />
      <Route path="booking-management" element={<BookingManagementPage />} />
      <Route path="guest-booking-management" element={<GuestBookingManagementPage />} />
      <Route path="booking-search" element={<BookingSearchPage />} />
      
      {/* Legacy and Aliases */}
      <Route path="search" element={<Navigate to="/hotels/search" replace />} />
    </Routes>
  );
};

export default PublicModule;
