import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services and components
import { bookingService } from '../services/bookingService';
import { Card, Button, ScreenContainer } from '../components/common';
import { colors, typography, spacing, globalStyles, borderRadius, shadows } from '../styles/globalStyles';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { booking } = route.params;
  const [loading, setLoading] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
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
      case 'checked_in':
      case 'checked-in':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  // Handle cancel booking
  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        {
          text: 'Keep Booking',
          style: 'cancel',
        },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: Implement booking cancellation API call
              Alert.alert(
                'Booking Cancelled',
                'Your booking has been cancelled successfully. You will receive a confirmation email shortly.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again or contact support.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle modify booking
  const handleModifyBooking = () => {
    Alert.alert(
      'Modify Booking',
      'To modify your booking, please call our customer service team.',
      [
        {
          text: 'Call Now',
          onPress: () => Linking.openURL('tel:+251911123456'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Handle contact hotel
  const handleContactHotel = () => {
    const phoneNumber = '+251911123456'; // Default hotel phone
    const emailAddress = 'info@addissunshine.com'; // Default hotel email
    
    Alert.alert(
      'Contact Hotel',
      `Contact ${booking.hotelName || 'the hotel'}`,
      [
        {
          text: 'Call Hotel',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`).catch(err => {
              Alert.alert('Error', 'Unable to make phone call. Please dial manually: ' + phoneNumber);
            });
          },
        },
        {
          text: 'Send Email',
          onPress: () => {
            const subject = `Booking Inquiry - ${booking.confirmationNumber}`;
            const body = `Hello,\n\nI have a question about my booking with confirmation number: ${booking.confirmationNumber}\n\nThank you.`;
            const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            Linking.openURL(emailUrl).catch(err => {
              Alert.alert('Error', 'Unable to open email app. Please send email manually to: ' + emailAddress);
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Handle download receipt
  const handleDownloadReceipt = () => {
    setLoading(true);
    
    // Simulate API call for receipt generation
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Receipt Sent',
        `Your booking receipt for confirmation number ${booking.confirmationNumber} has been sent to ${booking.guestEmail}.`,
        [
          {
            text: 'OK',
          },
        ]
      );
    }, 1500);
  };

  // Handle book another hotel
  const handleBookAnotherHotel = () => {
    // Navigate to the main search/booking screen in the main tabs
    navigation.navigate('MainTabs', { screen: 'Search' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="receipt-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.confirmationNumber}>#{booking.bookingReference || booking.confirmationNumber}</Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(booking.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status || 'Confirmed'}
          </Text>
        </View>

        {/* Hotel Information */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hotel Information</Text>
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{booking.hotelName}</Text>
            {booking.hotelAddress && (
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.addressText}>{booking.hotelAddress}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Booking Information */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Check-in</Text>
                <Text style={styles.detailValue}>
                  {formatDate(booking.checkInDate)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Check-out</Text>
                <Text style={styles.detailValue}>
                  {formatDate(booking.checkOutDate)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Guests</Text>
                <Text style={styles.detailValue}>
                  {booking.numberOfGuests || booking.guests} {(booking.numberOfGuests || booking.guests) === 1 ? 'guest' : 'guests'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Room</Text>
                <Text style={styles.detailValue}>
                  {booking.roomNumber ? `Room ${booking.roomNumber}` : booking.roomType || 'Standard Room'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Guest Information */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          <View style={styles.guestInfo}>
            <View style={styles.guestDetail}>
              <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.guestText}>
                {booking.guestFirstName ? `${booking.guestFirstName} ${booking.guestLastName}` : booking.guestName}
              </Text>
            </View>
            
            <View style={styles.guestDetail}>
              <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.guestText}>{booking.guestEmail}</Text>
            </View>
            
            {booking.guestPhone && (
              <View style={styles.guestDetail}>
                <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.guestText}>{booking.guestPhone}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Pricing Information */}
        {booking.totalAmount && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.pricingDetail}>
              <Text style={styles.pricingLabel}>Total Amount</Text>
              <Text style={styles.pricingValue}>
                ETB {booking.totalAmount.toLocaleString()}
              </Text>
            </View>
            
            {booking.paymentStatus && (
              <View style={styles.pricingDetail}>
                <Text style={styles.pricingLabel}>Payment Status</Text>
                <Text style={[
                  styles.pricingValue,
                  { color: getStatusColor(booking.paymentStatus) }
                ]}>
                  {booking.paymentStatus}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Special Requests */}
        {booking.specialRequests && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
            <Text style={styles.requestsText}>{booking.specialRequests}</Text>
          </Card>
        )}

        {/* Action Buttons - Only the three shown in screenshot */}
        <View style={styles.actionsContainer}>
          <Button
            title="Download Receipt"
            onPress={handleDownloadReceipt}
            style={[styles.actionButton, styles.primaryButton]}
            loading={loading}
            icon={!loading && <Ionicons name="download-outline" size={20} color={colors.textOnPrimary} />}
          />
          
          <Button
            title="Contact Hotel"
            variant="outline"
            onPress={handleContactHotel}
            style={styles.actionButton}
            icon={<Ionicons name="call-outline" size={20} color={colors.primary} />}
          />

          <Button
            title="Book Another Hotel"
            variant="outline"
            onPress={handleBookAnotherHotel}
            style={styles.actionButton}
            icon={<Ionicons name="search-outline" size={20} color={colors.primary} />}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xl, // Extra bottom padding for better scrolling
  },
  
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
  },
  
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  confirmationNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  
  statusText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    textTransform: 'capitalize',
  },
  
  sectionCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  hotelInfo: {
    alignItems: 'center',
  },
  
  hotelName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  addressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  
  detailText: {
    marginLeft: spacing.sm,
    flex: 1,
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
  
  guestInfo: {
    // No additional styles needed
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
  
  pricingDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  pricingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  pricingValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  
  requestsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    fontStyle: 'italic',
  },
  
  actionsContainer: {
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  
  actionButton: {
    marginBottom: spacing.md,
    minHeight: 52, // Slightly taller for better touch target
  },
  
  primaryButton: {
    backgroundColor: colors.primary,
    elevation: 2, // Add subtle shadow on Android
    shadowColor: colors.primary, // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default BookingDetailsScreen;
