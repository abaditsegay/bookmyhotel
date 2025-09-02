import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services and components
import { bookingService } from '../services/bookingService';
import { Card, Button, Input, LoadingSpinner, ScreenContainer } from '../components/common';
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

    try {
      const response = await bookingService.lookupBooking({
        bookingReference: lookupForm.bookingReference.trim(),
        email: lookupForm.email.trim(),
      });

      if (response.success) {
        // Navigate to dedicated booking details screen
        navigation.navigate('BookingDetails', {
          booking: response.data
        });
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

  return (
    <ScreenContainer 
      scrollable={true} 
      keyboardAvoiding={true}
    >
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

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner text="Looking up your booking..." />
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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
