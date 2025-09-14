import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import { Card, Button, LoadingSpinner, ScreenContainer } from '../components/common';
import { colors, typography, spacing, globalStyles } from '../styles/globalStyles';
import { formatDate, calculateNights } from '../utils/dateUtils';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { booking, hotel } = route.params;
  
  // State for additional actions
  const [loading, setLoading] = useState(false);

  // Calculate booking details
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const formattedCheckIn = formatDate(booking.checkInDate);
  const formattedCheckOut = formatDate(booking.checkOutDate);

  // Set up navigation options
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // Remove back button
      gestureEnabled: false, // Disable swipe back
    });
  }, [navigation]);

  // Handle sharing booking details
  const handleShare = async () => {
    try {
      const shareMessage = `🏨 Booking Confirmed!\n\n` +
        `Hotel: ${hotel.name}\n` +
        `Booking Reference: ${booking.bookingReference}\n` +
        `Check-in: ${formattedCheckIn}\n` +
        `Check-out: ${formattedCheckOut}\n` +
        `Guest: ${booking.guestFirstName} ${booking.guestLastName}\n` +
        `Total: ETB ${booking.totalAmount.toLocaleString()}\n\n` +
        `Booked via BookMyHotel`;

      await Share.share({
        message: shareMessage,
        title: 'Hotel Booking Confirmation',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Handle calling hotel
  const handleCallHotel = () => {
    if (hotel.phone) {
      const phoneUrl = `tel:${hotel.phone}`;
      Linking.canOpenURL(phoneUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(phoneUrl);
          } else {
            Alert.alert('Error', 'Phone calls are not supported on this device');
          }
        })
        .catch((error) => {
          console.error('Phone call error:', error);
          Alert.alert('Error', 'Unable to make phone call');
        });
    } else {
      Alert.alert('Info', 'Hotel phone number not available');
    }
  };

  // Handle email hotel
  const handleEmailHotel = () => {
    if (hotel.email) {
      const emailUrl = `mailto:${hotel.email}?subject=Booking Inquiry - ${booking.bookingReference}`;
      Linking.canOpenURL(emailUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(emailUrl);
          } else {
            Alert.alert('Error', 'Email is not supported on this device');
          }
        })
        .catch((error) => {
          console.error('Email error:', error);
          Alert.alert('Error', 'Unable to open email');
        });
    } else {
      Alert.alert('Info', 'Hotel email not available');
    }
  };

  // Navigate to new search
  const handleNewSearch = () => {
    navigation.navigate('MainTabs', { screen: 'Search' });
  };

  // Navigate to home
  const handleGoHome = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return colors.primary;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <ScreenContainer scrollable={true}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your reservation has been successfully created
        </Text>
      </View>

      {/* Booking Reference */}
      <Card style={styles.referenceCard}>
        <View style={styles.referenceHeader}>
          <Text style={styles.referenceLabel}>Booking Reference</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.referenceNumber}>#{booking.bookingReference}</Text>
        <Text style={styles.referenceNote}>
          Save this reference number for your records
        </Text>
      </Card>

      {/* Booking Status */}
      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusLabel}>Booking Status</Text>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(booking.status) }
              ]} />
              <Text style={[
                styles.statusText,
                { color: getStatusColor(booking.status) }
              ]}>
                {booking.status || 'Confirmed'}
              </Text>
            </View>
          </View>
          
          {booking.paymentStatus && (
            <View style={styles.statusRight}>
              <Text style={styles.statusLabel}>Payment</Text>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(booking.paymentStatus) }
              ]}>
                {booking.paymentStatus}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Hotel Information */}
      <Card style={styles.hotelCard}>
        <Text style={styles.sectionTitle}>Hotel Details</Text>
        
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          {hotel.address && (
            <View style={styles.hotelAddress}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.hotelAddressText}>{hotel.address}</Text>
            </View>
          )}
          
          {hotel.rating && (
            <View style={styles.hotelRating}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={styles.hotelRatingText}>
                {hotel.rating} ({hotel.reviewCount || 0} reviews)
              </Text>
            </View>
          )}
        </View>

        {/* Hotel Contact Actions */}
        <View style={styles.contactActions}>
          {hotel.phone && (
            <Button
              title="Call Hotel"
              variant="outline"
              size="small"
              onPress={handleCallHotel}
              leftIcon={<Ionicons name="call-outline" size={16} color={colors.primary} />}
              style={styles.contactButton}
            />
          )}
          
          {hotel.email && (
            <Button
              title="Email Hotel"
              variant="outline"
              size="small"
              onPress={handleEmailHotel}
              leftIcon={<Ionicons name="mail-outline" size={16} color={colors.primary} />}
              style={styles.contactButton}
            />
          )}
        </View>
      </Card>

      {/* Booking Details */}
      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Check-in</Text>
                <Text style={styles.detailValue}>{formattedCheckIn}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Check-out</Text>
                <Text style={styles.detailValue}>{formattedCheckOut}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Room Type</Text>
                <Text style={styles.detailValue}>{booking.roomType}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Guests</Text>
                <Text style={styles.detailValue}>
                  {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="moon-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>
                  ETB {booking.totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* Guest Information */}
      <Card style={styles.guestCard}>
        <Text style={styles.sectionTitle}>Guest Information</Text>
        
        <View style={styles.guestInfo}>
          <View style={styles.guestDetail}>
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.guestText}>
              {booking.guestFirstName} {booking.guestLastName}
            </Text>
          </View>
          
          <View style={styles.guestDetail}>
            <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.guestText}>{booking.guestEmail}</Text>
          </View>
          
          <View style={styles.guestDetail}>
            <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.guestText}>{booking.guestPhone}</Text>
          </View>
        </View>

        {booking.specialRequests && (
          <View style={styles.specialRequests}>
            <Text style={styles.specialRequestsLabel}>Special Requests:</Text>
            <Text style={styles.specialRequestsText}>{booking.specialRequests}</Text>
          </View>
        )}
      </Card>

      {/* Important Information */}
      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Important Information</Text>
        
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={colors.warning} />
            <Text style={styles.infoText}>
              Standard check-in time is 3:00 PM and check-out is 11:00 AM
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="card-outline" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              Please bring a valid ID and the booking reference for check-in
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={16} color={colors.success} />
            <Text style={styles.infoText}>
              Contact the hotel directly for any changes or special requests
            </Text>
          </View>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          title="Book Another Hotel"
          onPress={handleNewSearch}
          style={styles.actionButton}
          leftIcon={<Ionicons name="search-outline" size={16} color={colors.textOnPrimary} />}
        />
        
        <Button
          title="Share Booking"
          variant="outline"
          onPress={handleShare}
          style={styles.actionButton}
          leftIcon={<Ionicons name="share-outline" size={16} color={colors.primary} />}
        />
        
        <Button
          title="Go to Home"
          variant="ghost"
          onPress={handleGoHome}
          style={styles.actionButton}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
  },
  
  successIcon: {
    marginBottom: spacing.md,
  },
  
  successTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  successSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  
  referenceCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  referenceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  
  shareButton: {
    padding: spacing.xs,
  },
  
  referenceNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  
  referenceNote: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  statusCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statusLeft: {
    flex: 1,
  },
  
  statusRight: {
    alignItems: 'flex-end',
  },
  
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  
  statusText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  
  hotelCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  hotelInfo: {
    marginBottom: spacing.md,
  },
  
  hotelName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  hotelAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  hotelAddressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  hotelRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  hotelRatingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  contactButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  
  detailsCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  detailsGrid: {
    // No additional styles
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  detailText: {
    marginLeft: spacing.sm,
  },
  
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  
  totalAmount: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  
  guestCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  guestInfo: {
    marginBottom: spacing.md,
  },
  
  guestDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  guestText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  
  specialRequests: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  specialRequestsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  specialRequestsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    fontStyle: 'italic',
  },
  
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.lightGray,
  },
  
  infoList: {
    // No additional styles
  },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  
  actionSection: {
    // No additional styles
  },
  
  actionButton: {
    marginBottom: spacing.sm,
  },
});

export default BookingConfirmationScreen;
