import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services and components
import { bookingService } from '../services/bookingService';
import { Card, Button, Input, LoadingSpinner } from '../components/common';
import { colors, typography, spacing, globalStyles } from '../styles/globalStyles';
import { validateEmail } from '../utils/validation';

const BookingLookupScreen = ({ navigation }) => {
  // Form state
  const [lookupForm, setLookupForm] = useState({
    bookingReference: '',
    email: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);

  // Create static icon components to prevent re-renders
  const ReceiptIcon = <Ionicons name="receipt-outline" size={20} color={colors.textSecondary} />;
  const MailIcon = <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />;

  // Memoized form update functions to prevent re-renders
  const updateBookingReference = useCallback((text) => {
    setLookupForm(prev => ({
      ...prev,
      bookingReference: text,
    }));
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      bookingReference: null,
    }));
  }, []);

  const updateEmail = useCallback((text) => {
    setLookupForm(prev => ({
      ...prev,
      email: text,
    }));
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      email: null,
    }));
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!lookupForm.bookingReference.trim()) {
      newErrors.bookingReference = 'Booking reference is required';
    } else if (lookupForm.bookingReference.trim().length < 6) {
      newErrors.bookingReference = 'Booking reference must be at least 6 characters';
    }

    if (!lookupForm.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(lookupForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle lookup
  const handleLookup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setBooking(null);

    try {
      const response = await bookingService.lookupBooking({
        bookingReference: lookupForm.bookingReference.trim(),
        email: lookupForm.email.trim(),
      });

      if (response.success) {
        setBooking(response.data);
      } else {
        Alert.alert(
          'Booking Not Found',
          'No booking found with the provided reference and email. Please check your details and try again.'
        );
      }
    } catch (error) {
      console.error('Booking lookup error:', error);
      Alert.alert(
        'Error',
        'Failed to lookup booking. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear results
  const handleClearResults = () => {
    setBooking(null);
    setLookupForm({
      bookingReference: '',
      email: '',
    });
    setErrors({});
  };

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
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="search-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Find Your Booking</Text>
          <Text style={styles.headerSubtitle}>
            Enter your booking reference and email address to view your reservation details
          </Text>
        </View>

        {/* Lookup Form */}
        {!booking && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Booking Lookup</Text>
            
            <Input
              label="Booking Reference"
              placeholder="Enter your booking reference"
              value={lookupForm.bookingReference}
              onChangeText={updateBookingReference}
              error={errors.bookingReference}
              autoCapitalize="characters"
              leftIcon={ReceiptIcon}
            />

            <Input
              label="Email Address"
              placeholder="Enter your email address"
              value={lookupForm.email}
              onChangeText={updateEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={MailIcon}
            />

            <Button
              title="Find My Booking"
              onPress={handleLookup}
              loading={loading}
              style={styles.lookupButton}
            />
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner text="Looking up your booking..." />
          </View>
        )}

        {/* Booking Details */}
        {booking && (
          <View style={styles.bookingContainer}>
            <Card style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.bookingHeaderLeft}>
                  <Text style={styles.bookingReference}>
                    #{booking.bookingReference}
                  </Text>
                  <View style={styles.bookingStatus}>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(booking.status) }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(booking.status) }
                    ]}>
                      {booking.status || 'Unknown'}
                    </Text>
                  </View>
                </View>
                
                <Button
                  title="New Search"
                  variant="outline"
                  size="small"
                  onPress={handleClearResults}
                />
              </View>

              {/* Hotel Information */}
              <View style={styles.hotelSection}>
                <Text style={styles.sectionTitle}>Hotel Details</Text>
                <Text style={styles.hotelName}>{booking.hotelName}</Text>
                {booking.hotelAddress && (
                  <View style={styles.hotelAddress}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.hotelAddressText}>{booking.hotelAddress}</Text>
                  </View>
                )}
              </View>

              {/* Booking Information */}
              <View style={styles.bookingSection}>
                <Text style={styles.sectionTitle}>Booking Details</Text>
                
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
                        {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Room</Text>
                      <Text style={styles.detailValue}>
                        {booking.roomType || 'Standard Room'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Guest Information */}
              <View style={styles.guestSection}>
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
                  
                  {booking.guestPhone && (
                    <View style={styles.guestDetail}>
                      <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.guestText}>{booking.guestPhone}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Pricing Information */}
              {booking.totalAmount && (
                <View style={styles.pricingSection}>
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
                </View>
              )}

              {/* Special Requests */}
              {booking.specialRequests && (
                <View style={styles.requestsSection}>
                  <Text style={styles.sectionTitle}>Special Requests</Text>
                  <Text style={styles.requestsText}>{booking.specialRequests}</Text>
                </View>
              )}
            </Card>

            {/* Actions */}
            <View style={styles.actionsSection}>
              <Button
                title="Book Another Hotel"
                variant="outline"
                onPress={() => navigation.navigate('Search')}
                style={styles.actionButton}
              />
            </View>
          </View>
        )}

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you're having trouble finding your booking, please check:
          </Text>
          <View style={styles.helpList}>
            <Text style={styles.helpItem}>• Booking reference spelling</Text>
            <Text style={styles.helpItem}>• Email address used for booking</Text>
            <Text style={styles.helpItem}>• Spam/junk email folder</Text>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  
  lookupButton: {
    marginTop: spacing.md,
  },
  
  loadingContainer: {
    padding: spacing.xl,
  },
  
  bookingContainer: {
    marginBottom: spacing.lg,
  },
  
  bookingCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  bookingHeaderLeft: {
    flex: 1,
  },
  
  bookingReference: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  bookingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  
  hotelSection: {
    marginBottom: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
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
  },
  
  hotelAddressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  bookingSection: {
    marginBottom: spacing.lg,
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
  
  guestSection: {
    marginBottom: spacing.lg,
  },
  
  guestInfo: {
    // No additional styles
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
  
  pricingSection: {
    marginBottom: spacing.lg,
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
  
  requestsSection: {
    marginBottom: spacing.md,
  },
  
  requestsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    fontStyle: 'italic',
  },
  
  actionsSection: {
    // No additional styles
  },
  
  actionButton: {
    marginBottom: spacing.sm,
  },
  
  helpCard: {
    padding: spacing.lg,
    backgroundColor: colors.lightGray,
  },
  
  helpTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  
  helpList: {
    paddingLeft: spacing.sm,
  },
  
  helpItem: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default BookingLookupScreen;
