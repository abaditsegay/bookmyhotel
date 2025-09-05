import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common';
import { colors, typography, spacing, borderRadius } from '../../styles/globalStyles';
import { formatDate, calculateNights } from '../../utils/dateUtils';

const BookingSummary = ({ 
  hotel,
  roomType,
  searchParams,
  guestInfo = {},
  onEdit,
  showEditButtons = true,
  style = {}
}) => {
  // Calculate booking details
  const checkInDate = new Date(searchParams.checkInDate);
  const checkOutDate = new Date(searchParams.checkOutDate);
  const nights = calculateNights(checkInDate, checkOutDate);
  const guests = searchParams.guests || 1;
  const roomRate = roomType?.pricePerNight || 0;
  const subtotal = roomRate * nights;
  
  // Calculate taxes and fees (example calculations)
  const taxRate = 0.10; // 10% tax
  const serviceFee = 15; // Flat service fee
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes + serviceFee;

  const EditButton = ({ onPress, label }) => (
    <TouchableOpacity 
      style={styles.editButton} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.editButtonText}>{label}</Text>
      <Ionicons name="pencil" size={14} color={colors.primary} />
    </TouchableOpacity>
  );

  const SummaryRow = ({ label, value, style: rowStyle = {}, valueStyle = {} }) => (
    <View style={[styles.summaryRow, rowStyle]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, valueStyle]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Hotel Information */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hotel</Text>
          {showEditButtons && onEdit && (
            <EditButton onPress={() => onEdit('hotel')} label="Change" />
          )}
        </View>
        
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{hotel?.name || 'Hotel Name'}</Text>
          <View style={styles.hotelLocationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.hotelLocation}>
              {hotel?.address ? `${hotel.address}, ` : ''}
              {hotel?.city || hotel?.destination || 'Location'}
            </Text>
          </View>
          {hotel?.rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={colors.secondary} />
              <Text style={styles.ratingText}>{hotel.rating} stars</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Booking Details */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          {showEditButtons && onEdit && (
            <EditButton onPress={() => onEdit('dates')} label="Change" />
          )}
        </View>
        
        <View style={styles.bookingDetails}>
          <SummaryRow 
            label="Check-in" 
            value={formatDate(checkInDate)}
          />
          <SummaryRow 
            label="Check-out" 
            value={formatDate(checkOutDate)}
          />
          <SummaryRow 
            label="Duration" 
            value={`${nights} night${nights > 1 ? 's' : ''}`}
          />
          <SummaryRow 
            label="Guests" 
            value={`${guests} guest${guests > 1 ? 's' : ''}`}
          />
        </View>
      </Card>

      {/* Room Information */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Room</Text>
          {showEditButtons && onEdit && (
            <EditButton onPress={() => onEdit('room')} label="Change" />
          )}
        </View>
        
        <View style={styles.roomInfo}>
          <Text style={styles.roomType}>
            {roomType?.roomType || 'Room Type'}
          </Text>
          {roomType?.description && (
            <Text style={styles.roomDescription}>
              {roomType.description}
            </Text>
          )}
          <View style={styles.roomFeatures}>
            {roomType?.maxGuests && (
              <View style={styles.featureItem}>
                <Ionicons name="people" size={14} color={colors.textSecondary} />
                <Text style={styles.featureText}>
                  Max {roomType.maxGuests} guests
                </Text>
              </View>
            )}
            {roomType?.bedConfiguration && (
              <View style={styles.featureItem}>
                <Ionicons name="bed" size={14} color={colors.textSecondary} />
                <Text style={styles.featureText}>
                  {roomType.bedConfiguration}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>

      {/* Guest Information (if available) */}
      {(guestInfo.firstName || guestInfo.email) && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guest Information</Text>
            {showEditButtons && onEdit && (
              <EditButton onPress={() => onEdit('guest')} label="Edit" />
            )}
          </View>
          
          <View style={styles.guestInfo}>
            {guestInfo.firstName && (
              <SummaryRow 
                label="Name" 
                value={`${guestInfo.firstName} ${guestInfo.lastName || ''}`.trim()}
              />
            )}
            {guestInfo.email && (
              <SummaryRow 
                label="Email" 
                value={guestInfo.email}
              />
            )}
            {guestInfo.phone && (
              <SummaryRow 
                label="Phone" 
                value={guestInfo.phone}
              />
            )}
          </View>
        </Card>
      )}

      {/* Pricing Breakdown */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        
        <View style={styles.pricingDetails}>
          <SummaryRow 
            label={`${roomRate} × ${nights} night${nights > 1 ? 's' : ''}`}
            value={`$${subtotal}`}
          />
          <SummaryRow 
            label="Taxes & fees"
            value={`$${(taxes + serviceFee).toFixed(2)}`}
          />
          <View style={styles.separator} />
          <SummaryRow 
            label="Total"
            value={`$${total.toFixed(2)}`}
            style={styles.totalRow}
            valueStyle={styles.totalValue}
          />
        </View>
        
        <View style={styles.paymentInfo}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={styles.paymentInfoText}>
            You will be charged at the hotel
          </Text>
        </View>
      </Card>

      {/* Cancellation Policy */}
      <Card style={styles.section}>
        <View style={styles.policyHeader}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.policyTitle}>Cancellation Policy</Text>
        </View>
        
        <Text style={styles.policyText}>
          {roomType?.cancellationPolicy || 
           'Free cancellation until 24 hours before check-in. After that, you will be charged for the first night.'}
        </Text>
        
        <Text style={styles.policySubtext}>
          Times are based on the hotel's local time zone.
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
    marginRight: spacing.xs,
  },
  hotelInfo: {
    gap: spacing.sm,
  },
  hotelName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  hotelLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  bookingDetails: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  roomInfo: {
    gap: spacing.sm,
  },
  roomType: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  roomDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  roomFeatures: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  guestInfo: {
    gap: spacing.sm,
  },
  pricingDetails: {
    gap: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalRow: {
    paddingVertical: spacing.sm,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.sm,
  },
  paymentInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  policyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  policyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.sm,
  },
  policySubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default BookingSummary;
