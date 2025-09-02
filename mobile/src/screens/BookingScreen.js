import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services and components
import { bookingService } from '../services/bookingService';
import { Card, Button, Input, LoadingSpinner, ScreenContainer } from '../components/common';
import { colors, typography, spacing, globalStyles } from '../styles/globalStyles';
import { validateEmail, validatePhone } from '../utils/validation';
import { formatDate, calculateNights } from '../utils/dateUtils';

const BookingScreen = ({ route, navigation }) => {
  // Get booking parameters from navigation
  const { 
    hotel, 
    room, 
    searchParams
  } = route.params;

  // Extract booking details from searchParams
  const checkInDate = new Date(searchParams.checkInDate);
  const checkOutDate = new Date(searchParams.checkOutDate);
  const numberOfGuests = searchParams.guests || 1;

  // Guest information form state
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Use ref to track form state for navigation without causing re-renders
  const guestFormRef = useRef(guestForm);
  
  // Keep ref in sync with state
  useEffect(() => {
    guestFormRef.current = guestForm;
  }, [guestForm]);

  // Calculate booking details
  const nights = calculateNights(checkInDate, checkOutDate);
  const formattedCheckIn = formatDate(checkInDate);
  const formattedCheckOut = formatDate(checkOutDate);
  const totalAmount = room?.pricePerNight ? room.pricePerNight * nights : 0;

  // Create static icon components to prevent re-renders
  const PersonIcon = useMemo(() => <Ionicons name="person-outline" size={20} color={colors.textSecondary} />, []);
  const MailIcon = useMemo(() => <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />, []);
  const PhoneIcon = useMemo(() => <Ionicons name="call-outline" size={20} color={colors.textSecondary} />, []);
  const ChatIcon = useMemo(() => <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />, []);

  // Memoized form update functions to prevent re-renders
  const updateFirstName = useCallback((text) => {
    const newForm = {
      ...guestFormRef.current,
      firstName: text,
    };
    setGuestForm(newForm);
    guestFormRef.current = newForm;
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      firstName: null,
    }));
  }, []);

  const updateLastName = useCallback((text) => {
    const newForm = {
      ...guestFormRef.current,
      lastName: text,
    };
    setGuestForm(newForm);
    guestFormRef.current = newForm;
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      lastName: null,
    }));
  }, []);

  const updateEmail = useCallback((text) => {
    const newForm = {
      ...guestFormRef.current,
      email: text,
    };
    setGuestForm(newForm);
    guestFormRef.current = newForm;
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      email: null,
    }));
  }, []);

  const updatePhone = useCallback((text) => {
    const newForm = {
      ...guestFormRef.current,
      phone: text,
    };
    setGuestForm(newForm);
    guestFormRef.current = newForm;
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      phone: null,
    }));
  }, []);

  const updateSpecialRequests = useCallback((text) => {
    const newForm = {
      ...guestFormRef.current,
      specialRequests: text,
    };
    setGuestForm(newForm);
    guestFormRef.current = newForm;
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      specialRequests: null,
    }));
  }, []);

  // Validate guest form
  const validateGuestForm = () => {
    const newErrors = {};

    if (!guestForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (guestForm.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!guestForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (guestForm.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!guestForm.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(guestForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!guestForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(guestForm.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Please agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!validateGuestForm()) {
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        hotelId: hotel.id,
        roomType: room?.roomType || 'Standard Room',
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: numberOfGuests,
        guestFirstName: guestForm.firstName.trim(),
        guestLastName: guestForm.lastName.trim(),
        guestEmail: guestForm.email.trim(),
        guestPhone: guestForm.phone.trim(),
        specialRequests: guestForm.specialRequests.trim(),
        totalAmount: totalAmount,
      };

      const response = await bookingService.createBooking(bookingData);

      if (response.success) {
        // Navigate to confirmation screen
        navigation.replace('BookingConfirmation', {
          booking: response.data,
          hotel: hotel,
        });
      } else {
        Alert.alert(
          'Booking Failed',
          response.message || 'Unable to complete your booking. Please try again.'
        );
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        'Error',
        'An error occurred while processing your booking. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation with confirmation
  const handleBackPress = useCallback(() => {
    const hasFormData = Object.values(guestFormRef.current).some(value => value.trim() !== '');
    
    if (hasFormData) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [navigation]);

  // Set up navigation header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textOnPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleBackPress]);

  return (
    <ScreenContainer
      keyboardAvoiding={true}
    >
      {/* Booking Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.hotelLocation}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.hotelLocationText}>{hotel.address}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
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
                <Text style={styles.detailLabel}>Room</Text>
                <Text style={styles.detailValue}>{room?.roomType || 'Standard Room'}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Guests</Text>
                <Text style={styles.detailValue}>{numberOfGuests} {numberOfGuests === 1 ? 'guest' : 'guests'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="moon-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{nights} {nights === 1 ? 'night' : 'nights'}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Total</Text>
                <Text style={styles.totalAmount}>ETB {totalAmount.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* Guest Information Form */}
      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Guest Information</Text>
        <Text style={styles.formSubtitle}>
          Please provide your details for the booking
        </Text>

        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={guestForm.firstName}
              onChangeText={updateFirstName}
              error={errors.firstName}
              autoCapitalize="words"
              leftIcon={PersonIcon}
            />
          </View>
          
          <View style={styles.nameField}>
            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={guestForm.lastName}
              onChangeText={updateLastName}
              error={errors.lastName}
              autoCapitalize="words"
              leftIcon={PersonIcon}
            />
          </View>
        </View>

        <Input
          label="Email Address"
          placeholder="Enter your email address"
          value={guestForm.email}
          onChangeText={updateEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={MailIcon}
        />

        <Input
          label="Phone Number"
          placeholder="Enter your phone number"
          value={guestForm.phone}
          onChangeText={updatePhone}
          error={errors.phone}
          keyboardType="phone-pad"
          leftIcon={PhoneIcon}
        />

        <Input
          label="Special Requests (Optional)"
          placeholder="Any special requests or requirements..."
          value={guestForm.specialRequests}
          onChangeText={updateSpecialRequests}
          multiline={true}
          numberOfLines={3}
          leftIcon={ChatIcon}
        />
      </Card>

      {/* Terms and Conditions */}
      <Card style={styles.termsCard}>
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[
            styles.checkbox,
            agreedToTerms && styles.checkboxChecked
          ]}>
            {agreedToTerms && (
              <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />
            )}
          </View>
          <View style={styles.termsText}>
            <Text style={styles.termsLabel}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms and Conditions</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </TouchableOpacity>
        
        {errors.terms && (
          <Text style={styles.termsError}>{errors.terms}</Text>
        )}
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          title="Complete Booking"
          onPress={handleBooking}
          loading={loading}
          disabled={loading}
          style={styles.bookingButton}
        />
        
        <Button
          title="Review Details"
          variant="outline"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.reviewButton}
        />
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <View style={styles.securityIcon}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
        </View>
        <Text style={styles.securityText}>
          Your information is secure and encrypted
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  
  summaryCard: {
    ...globalStyles.cardLarge,
    marginBottom: spacing.md,
  },
  
  summaryTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  hotelInfo: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  hotelName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  hotelLocation: {
    ...globalStyles.row,
  },
  
  hotelLocationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  bookingDetails: {
    // No additional styles
  },
  
  detailRow: {
    ...globalStyles.rowBetween,
    marginBottom: spacing.md,
  },
  
  detailItem: {
    ...globalStyles.row,
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
  
  formCard: {
    ...globalStyles.cardLarge,
    marginBottom: spacing.md,
  },
  
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  formSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  
  nameRow: {
    ...globalStyles.rowBetween,
    marginBottom: spacing.sm,
  },
  
  nameField: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  
  termsCard: {
    ...globalStyles.cardLarge,
    marginBottom: spacing.md,
  },
  
  termsRow: {
    ...globalStyles.row,
    alignItems: 'flex-start',
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  
  termsText: {
    flex: 1,
  },
  
  termsLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  
  termsLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  
  termsError: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.sm,
    marginLeft: spacing.lg,
  },
  
  actionSection: {
    marginBottom: spacing.lg,
  },
  
  bookingButton: {
    marginBottom: spacing.sm,
  },
  
  reviewButton: {
    // No additional styles
  },
  
  securityNotice: {
    ...globalStyles.row,
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: spacing.sm,
  },
  
  securityIcon: {
    marginRight: spacing.sm,
  },
  
  securityText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default BookingScreen;
