import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { BookingForm, BookingSummary, BookingProgress } from '../components/booking';
import { colors, typography, spacing, globalStyles } from '../styles/globalStyles';
import { validateEmail, validatePhone } from '../utils/validation';
import { formatDate, calculateNights } from '../utils/dateUtils';

const BookingScreen = ({ route, navigation }) => {
  // Get booking parameters from navigation (updated for room type booking)
  const { 
    hotel, 
    roomType, // Changed from 'room' to 'roomType'
    searchParams
  } = route.params;

  // Extract booking details from searchParams
  const checkInDate = new Date(searchParams.checkInDate);
  const checkOutDate = new Date(searchParams.checkOutDate);
  const numberOfGuests = searchParams.guests || 1;

  // Guest information form state (following SearchScreen pattern)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSummary, setShowSummary] = useState(false);

  // Calculate booking details (updated for room type)
  const nights = calculateNights(checkInDate, checkOutDate);
  const formattedCheckIn = formatDate(checkInDate);
  const formattedCheckOut = formatDate(checkOutDate);
  const totalAmount = roomType?.pricePerNight ? roomType.pricePerNight * nights : 0;

  // Create static icon components to prevent re-renders
  const PersonIcon = useMemo(() => <Ionicons name="person-outline" size={20} color={colors.textSecondary} />, []);
  const MailIcon = useMemo(() => <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />, []);
  const PhoneIcon = useMemo(() => <Ionicons name="call-outline" size={20} color={colors.textSecondary} />, []);
  const ChatIcon = useMemo(() => <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />, []);

  // Simple form update handlers (following SearchScreen pattern)
  const handleFirstNameChange = useCallback((text) => {
    setFirstName(text);
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      firstName: null
    }));
  }, []);

  const handleLastNameChange = useCallback((text) => {
    setLastName(text);
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      lastName: null
    }));
  }, []);

  const handleEmailChange = useCallback((text) => {
    setEmail(text);
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      email: null
    }));
  }, []);

  const handlePhoneChange = useCallback((text) => {
    setPhone(text);
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      phone: null
    }));
  }, []);

  const handleSpecialRequestsChange = useCallback((text) => {
    setSpecialRequests(text);
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      specialRequests: null
    }));
  }, []);

  // Validate guest form
  const validateGuestForm = useCallback(() => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Please agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, email, phone, agreedToTerms]);

  // Handle booking submission
  const handleBooking = useCallback(async () => {
    if (!validateGuestForm()) {
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        hotelId: hotel.id,
        roomType: roomType?.roomType || roomType?.roomTypeName || 'Standard Room', // Use roomType data
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: numberOfGuests,
        guestFirstName: firstName.trim(),
        guestLastName: lastName.trim(),
        guestEmail: email.trim(),
        guestPhone: phone.trim(),
        specialRequests: specialRequests.trim(),
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
  }, [validateGuestForm, hotel, roomType, checkInDate, checkOutDate, numberOfGuests, firstName, lastName, email, phone, specialRequests, totalAmount, navigation]);

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

  // Handle form submission from BookingForm
  const handleFormSubmit = useCallback((formData) => {
    setFirstName(formData.firstName);
    setLastName(formData.lastName);
    setEmail(formData.email);
    setPhone(formData.phone);
    setSpecialRequests(formData.specialRequests);
    
    // Move to confirmation step
    setCurrentStep(3);
    setShowSummary(true);
  }, []);

  // Handle booking summary edit
  const handleEditSummary = useCallback((section) => {
    switch (section) {
      case 'guest':
        setCurrentStep(2);
        setShowSummary(false);
        break;
      case 'dates':
      case 'room':
      case 'hotel':
        // Navigate back to previous screens
        navigation.goBack();
        break;
      default:
        break;
    }
  }, [navigation]);

  // Get current guest info for summary
  const getCurrentGuestInfo = useCallback(() => ({
    firstName,
    lastName,
    email,
    phone,
    specialRequests
  }), [firstName, lastName, email, phone, specialRequests]);

  return (
    <ScreenContainer
      keyboardAvoiding={true}
      scrollEventThrottle={Platform.OS === 'android' ? 16 : undefined}
      removeClippedSubviews={Platform.OS === 'android'}
    >
      {/* Booking Progress */}
      <BookingProgress 
        currentStep={currentStep}
        totalSteps={3}
        steps={[
          { id: 1, title: 'Room Selected', icon: 'checkmark-circle' },
          { id: 2, title: 'Guest Details', icon: 'person-outline' },
          { id: 3, title: 'Confirmation', icon: 'checkmark-circle-outline' },
        ]}
      />

      {/* Step Content */}
      {currentStep === 1 && (
        // This step is automatically completed since user came from room selection
        <View style={styles.stepCompleted}>
          <Card style={styles.completedCard}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={styles.completedTitle}>Room Selected</Text>
            <Text style={styles.completedText}>
              {roomType?.roomType} at {hotel.name}
            </Text>
          </Card>
          <Button
            title="Continue to Guest Details"
            onPress={() => setCurrentStep(2)}
            style={styles.continueButton}
          />
        </View>
      )}

      {currentStep === 2 && !showSummary && (
        <BookingForm
          onSubmit={handleFormSubmit}
          loading={loading}
          initialData={getCurrentGuestInfo()}
          style={styles.bookingForm}
        />
      )}

      {(currentStep === 3 || showSummary) && (
        <View style={styles.summaryStep}>
          <BookingSummary
            hotel={hotel}
            roomType={roomType}
            searchParams={searchParams}
            guestInfo={getCurrentGuestInfo()}
            onEdit={handleEditSummary}
            showEditButtons={true}
            style={styles.bookingSummary}
          />
          
          <View style={styles.finalBookingSection}>
            <Card style={styles.termsCard}>
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                    {agreedToTerms && (
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the Terms and Conditions and Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Button
              title="Complete Booking"
              onPress={handleBooking}
              loading={loading}
              disabled={loading || !agreedToTerms}
              style={styles.finalBookButton}
            />
          </View>
        </View>
      )}
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
  
  // Step completed styles
  stepCompleted: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  completedCard: {
    ...globalStyles.cardLarge,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.successLight || '#e8f5e8',
    borderColor: colors.success,
    borderWidth: 1,
  },
  
  completedTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.success,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  completedText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  continueButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  
  // Booking form styles
  bookingForm: {
    flex: 1,
  },
  
  // Summary step styles
  summaryStep: {
    flex: 1,
  },
  
  bookingSummary: {
    marginBottom: spacing.lg,
  },
  
  finalBookingSection: {
    gap: spacing.md,
  },
  
  finalBookButton: {
    marginTop: spacing.sm,
  },
  
});

export default BookingScreen;
