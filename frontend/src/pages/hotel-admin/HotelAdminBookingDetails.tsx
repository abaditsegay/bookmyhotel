import React from 'react';
import UnifiedBookingDetails from '../../components/booking/UnifiedBookingDetails';

const HotelAdminBookingDetails: React.FC = () => {
  return (
    <UnifiedBookingDetails 
      mode="hotel-admin" 
      title="Hotel Admin - Booking Details"
    />
  );
};

export default HotelAdminBookingDetails;
