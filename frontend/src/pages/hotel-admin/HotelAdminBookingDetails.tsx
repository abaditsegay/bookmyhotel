import React from 'react';
import { useTranslation } from 'react-i18next';
import UnifiedBookingDetails from '../../components/booking/UnifiedBookingDetails';

const HotelAdminBookingDetails: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <UnifiedBookingDetails 
      mode="hotel-admin" 
      title={t('booking.details.hotelAdminTitle')}
    />
  );
};

export default HotelAdminBookingDetails;
