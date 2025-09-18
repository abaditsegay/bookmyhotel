import React from 'react';
import UnifiedBookingDetails from '../../components/booking/UnifiedBookingDetails';

const FrontDeskUnifiedBookingDetails: React.FC = () => {
  return (
    <UnifiedBookingDetails 
      mode="front-desk" 
      title="Front Desk - Booking Details"
    />
  );
};

export default FrontDeskUnifiedBookingDetails;
