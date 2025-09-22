import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import {
  MobileFormContainer,
  MobileInput,
  MobileSearchInput,
  MobileDateInput,
  MobileNumberInput,
  Button,
  useMobileForm,
} from '../components/common';
import { colors, typography, spacing } from '../styles/globalStyles';

/**
 * Demo screen showcasing the new mobile-optimized input components
 * This demonstrates proper usage and best practices
 */
const MobileInputDemoScreen = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    search: '',
    checkInDate: null,
    guests: '',
    price: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState({});
  
  // Form management hook
  const { inputRefs, focusNextInput, blurAllInputs } = useMobileForm(7);
  
  // Search suggestions for demo
  const searchSuggestions = [
    'Luxury Hotel',
    'Beach Resort',
    'City Center Hotel',
    'Mountain Lodge',
    'Spa Resort',
    'Business Hotel',
  ];

  // Generic form field handler
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (formData.guests && (parseInt(formData.guests) < 1 || parseInt(formData.guests) > 10)) {
      newErrors.guests = 'Guests must be between 1 and 10';
    }
    
    if (formData.price && parseFloat(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form submission
  const handleSubmit = useCallback(() => {
    blurAllInputs();
    
    if (validateForm()) {
      Alert.alert(
        'Success',
        'Form submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                email: '',
                search: '',
                checkInDate: null,
                guests: '',
                price: '',
                phone: '',
              });
            },
          },
        ]
      );
    } else {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
    }
  }, [validateForm, blurAllInputs]);

  // Handle search
  const handleSearch = useCallback((searchText) => {
    console.log('Searching for:', searchText);
  }, []);

  return (
    <MobileFormContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Mobile Input Components Demo</Text>
        <Text style={styles.subtitle}>
          Optimized for iOS and Android with proper focus management
        </Text>
      </View>

      {/* Basic Text Input */}
      <MobileInput
        ref={inputRefs[0]}
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChangeText={(value) => handleFieldChange('name', value)}
        error={errors.name}
        returnKeyType="next"
        onSubmitEditing={() => focusNextInput(0)}
        testID="name-input"
        accessibilityLabel="Full name input"
      />

      {/* Email Input */}
      <MobileInput
        ref={inputRefs[1]}
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChangeText={(value) => handleFieldChange('email', value)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => focusNextInput(1)}
        testID="email-input"
        accessibilityLabel="Email address input"
      />

      {/* Search Input with Suggestions */}
      <MobileSearchInput
        ref={inputRefs[2]}
        placeholder="Search hotels..."
        value={formData.search}
        onChangeText={(value) => handleFieldChange('search', value)}
        onSearch={handleSearch}
        showSuggestions={true}
        suggestions={searchSuggestions}
        onSuggestionPress={(suggestion) => handleFieldChange('search', suggestion)}
        testID="search-input"
        accessibilityLabel="Hotel search input"
      />

      {/* Date Picker Input */}
      <MobileDateInput
        ref={inputRefs[3]}
        label="Check-in Date"
        placeholder="Select check-in date"
        value={formData.checkInDate}
        onChange={(date) => handleFieldChange('checkInDate', date)}
        minimumDate={new Date()}
        testID="checkin-date-input"
        accessibilityLabel="Check-in date picker"
      />

      {/* Number Input for Guests */}
      <MobileNumberInput
        ref={inputRefs[4]}
        label="Number of Guests"
        placeholder="0"
        value={formData.guests}
        onChangeText={(value) => handleFieldChange('guests', value)}
        error={errors.guests}
        numberType="integer"
        minValue={1}
        maxValue={10}
        returnKeyType="next"
        onSubmitEditing={() => focusNextInput(4)}
        testID="guests-input"
        accessibilityLabel="Number of guests input"
      />

      {/* Currency Input */}
      <MobileNumberInput
        ref={inputRefs[5]}
        label="Maximum Price"
        placeholder="0.00"
        value={formData.price}
        onChangeText={(value) => handleFieldChange('price', value)}
        error={errors.price}
        numberType="currency"
        currencySymbol="$"
        minValue={0}
        maxValue={10000}
        returnKeyType="next"
        onSubmitEditing={() => focusNextInput(5)}
        testID="price-input"
        accessibilityLabel="Maximum price input"
      />

      {/* Phone Number Input */}
      <MobileNumberInput
        ref={inputRefs[6]}
        label="Phone Number"
        placeholder="(000) 000-0000"
        value={formData.phone}
        onChangeText={(value) => handleFieldChange('phone', value)}
        numberType="phone"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        testID="phone-input"
        accessibilityLabel="Phone number input"
      />

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Submit Form"
          onPress={handleSubmit}
          style={styles.submitButton}
          testID="submit-button"
        />
        
        <Button
          title="Clear Form"
          onPress={() => {
            setFormData({
              name: '',
              email: '',
              search: '',
              checkInDate: null,
              guests: '',
              price: '',
              phone: '',
            });
            setErrors({});
          }}
          variant="outline"
          style={styles.clearButton}
          testID="clear-button"
        />
      </View>

      {/* Demo Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Features Demonstrated:</Text>
        <Text style={styles.infoText}>• Stable focus management</Text>
        <Text style={styles.infoText}>• Platform-specific keyboard types</Text>
        <Text style={styles.infoText}>• Debounced search with suggestions</Text>
        <Text style={styles.infoText}>• Native date picker integration</Text>
        <Text style={styles.infoText}>• Number formatting and validation</Text>
        <Text style={styles.infoText}>• Proper accessibility support</Text>
        <Text style={styles.infoText}>• Keyboard avoidance behavior</Text>
      </View>
    </MobileFormContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  
  submitButton: {
    backgroundColor: colors.primary,
  },
  
  clearButton: {
    borderColor: colors.border,
  },
  
  infoContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default MobileInputDemoScreen;
