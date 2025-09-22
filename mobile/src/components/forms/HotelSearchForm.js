import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
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
import { searchHotels } from '../services/hotelService'; // Assuming this exists

/**
 * Enhanced hotel search form using new mobile-optimized components
 * Demonstrates proper usage patterns and best practices
 */
const HotelSearchForm = ({ onSearchResults }) => {
  // Form state
  const [formData, setFormData] = useState({
    destination: '',
    checkInDate: null,
    checkOutDate: null,
    guests: '2',
    rooms: '1',
    maxPrice: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  // Form management hook - 9 inputs total
  const { inputRefs, focusNextInput, blurAllInputs } = useMobileForm(9);

  // Mock destination suggestions (in real app, fetch from API)
  const availableDestinations = [
    'Addis Ababa, Ethiopia',
    'Bahir Dar, Ethiopia', 
    'Hawassa, Ethiopia',
    'Dire Dawa, Ethiopia',
    'Mekelle, Ethiopia',
    'Gondar, Ethiopia',
    'Jimma, Ethiopia',
  ];

  // Update suggestions based on search
  const updateDestinationSuggestions = useCallback((searchText) => {
    if (searchText.length > 0) {
      const filtered = availableDestinations.filter(dest =>
        dest.toLowerCase().includes(searchText.toLowerCase())
      );
      setDestinationSuggestions(filtered);
    } else {
      setDestinationSuggestions(availableDestinations.slice(0, 5));
    }
  }, []);

  // Generic form field handler with validation cleanup
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Special handling for date validation
    if (field === 'checkInDate' && errors.checkOutDate) {
      setErrors(prev => ({ ...prev, checkOutDate: null }));
    }
  }, [errors]);

  // Handle destination search with debouncing
  const handleDestinationSearch = useCallback((searchText) => {
    updateDestinationSuggestions(searchText);
  }, [updateDestinationSuggestions]);

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Required fields
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    
    if (!formData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }
    
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    }

    // Date logic validation
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out must be after check-in';
      }
    }

    // Number validations
    const guests = parseInt(formData.guests);
    if (isNaN(guests) || guests < 1 || guests > 20) {
      newErrors.guests = 'Guests must be between 1 and 20';
    }

    const rooms = parseInt(formData.rooms);
    if (isNaN(rooms) || rooms < 1 || rooms > 10) {
      newErrors.rooms = 'Rooms must be between 1 and 10';
    }

    // Email validation if provided
    if (formData.guestEmail && !/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      newErrors.guestEmail = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form submission
  const handleSearch = useCallback(async () => {
    blurAllInputs();
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare search parameters
      const searchParams = {
        destination: formData.destination,
        checkIn: formData.checkInDate,
        checkOut: formData.checkOutDate,
        guests: parseInt(formData.guests),
        rooms: parseInt(formData.rooms),
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
      };

      // Perform search (replace with actual API call)
      const results = await searchHotels(searchParams);
      
      // Handle results
      onSearchResults?.(results);
      
      Alert.alert(
        'Search Complete',
        `Found ${results.length} hotels matching your criteria.`,
        [{ text: 'OK', style: 'default' }]
      );
      
    } catch (error) {
      console.error('Hotel search error:', error);
      Alert.alert(
        'Search Error',
        'Unable to search hotels. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, blurAllInputs, onSearchResults]);

  // Initialize suggestions on mount
  useEffect(() => {
    updateDestinationSuggestions('');
  }, [updateDestinationSuggestions]);

  return (
    <MobileFormContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Perfect Hotel</Text>
        <Text style={styles.subtitle}>Search thousands of hotels worldwide</Text>
      </View>

      {/* Destination Search */}
      <MobileSearchInput
        ref={inputRefs[0]}
        placeholder="Where are you going?"
        value={formData.destination}
        onChangeText={(value) => handleFieldChange('destination', value)}
        onSearch={handleDestinationSearch}
        showSuggestions={true}
        suggestions={destinationSuggestions}
        onSuggestionPress={(suggestion) => {
          handleFieldChange('destination', suggestion);
          focusNextInput(0);
        }}
        error={errors.destination}
        testID="destination-search"
        accessibilityLabel="Destination search"
        accessibilityHint="Search for your travel destination"
      />

      {/* Date Selection */}
      <View style={styles.dateRow}>
        <View style={styles.dateColumn}>
          <MobileDateInput
            ref={inputRefs[1]}
            label="Check-in"
            placeholder="Select date"
            value={formData.checkInDate}
            onChange={(date) => handleFieldChange('checkInDate', date)}
            minimumDate={new Date()}
            error={errors.checkInDate}
            testID="checkin-date"
            accessibilityLabel="Check-in date"
          />
        </View>
        
        <View style={styles.dateColumn}>
          <MobileDateInput
            ref={inputRefs[2]}
            label="Check-out"
            placeholder="Select date"
            value={formData.checkOutDate}
            onChange={(date) => handleFieldChange('checkOutDate', date)}
            minimumDate={formData.checkInDate || new Date()}
            error={errors.checkOutDate}
            testID="checkout-date"
            accessibilityLabel="Check-out date"
          />
        </View>
      </View>

      {/* Guests and Rooms */}
      <View style={styles.numberRow}>
        <View style={styles.numberColumn}>
          <MobileNumberInput
            ref={inputRefs[3]}
            label="Guests"
            placeholder="2"
            value={formData.guests}
            onChangeText={(value) => handleFieldChange('guests', value)}
            error={errors.guests}
            numberType="integer"
            minValue={1}
            maxValue={20}
            returnKeyType="next"
            onSubmitEditing={() => focusNextInput(3)}
            testID="guests-input"
            accessibilityLabel="Number of guests"
          />
        </View>
        
        <View style={styles.numberColumn}>
          <MobileNumberInput
            ref={inputRefs[4]}
            label="Rooms"
            placeholder="1"
            value={formData.rooms}
            onChangeText={(value) => handleFieldChange('rooms', value)}
            error={errors.rooms}
            numberType="integer"
            minValue={1}
            maxValue={10}
            returnKeyType="next"
            onSubmitEditing={() => focusNextInput(4)}
            testID="rooms-input"
            accessibilityLabel="Number of rooms"
          />
        </View>
      </View>

      {/* Budget */}
      <MobileNumberInput
        ref={inputRefs[5]}
        label="Maximum Price Per Night (Optional)"
        placeholder="No limit"
        value={formData.maxPrice}
        onChangeText={(value) => handleFieldChange('maxPrice', value)}
        numberType="currency"
        currencySymbol="$"
        minValue={0}
        maxValue={50000}
        returnKeyType="next"
        onSubmitEditing={() => focusNextInput(5)}
        testID="max-price-input"
        accessibilityLabel="Maximum price per night"
      />

      {/* Guest Information (Optional) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Guest Information (Optional)</Text>
        <Text style={styles.sectionSubtitle}>Save time during booking</Text>
      </View>

      <MobileInput
        ref={inputRefs[6]}
        label="Full Name"
        placeholder="Enter guest name"
        value={formData.guestName}
        onChangeText={(value) => handleFieldChange('guestName', value)}
        returnKeyType="next"
        onSubmitEditing={() => focusNextInput(6)}
        testID="guest-name-input"
        accessibilityLabel="Guest name"
      />

      <MobileInput
        ref={inputRefs[7]}
        label="Email"
        placeholder="Enter email address"
        value={formData.guestEmail}
        onChangeText={(value) => handleFieldChange('guestEmail', value)}
        error={errors.guestEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => focusNextInput(7)}
        testID="guest-email-input"
        accessibilityLabel="Guest email"
      />

      <MobileNumberInput
        ref={inputRefs[8]}
        label="Phone Number"
        placeholder="(000) 000-0000"
        value={formData.guestPhone}
        onChangeText={(value) => handleFieldChange('guestPhone', value)}
        numberType="phone"
        returnKeyType="search"
        onSubmitEditing={handleSearch}
        testID="guest-phone-input"
        accessibilityLabel="Guest phone number"
      />

      {/* Search Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Searching..." : "Search Hotels"}
          onPress={handleSearch}
          disabled={loading}
          style={styles.searchButton}
          testID="search-button"
        />
      </View>

      {/* Quick Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Search Tips</Text>
        <Text style={styles.tipText}>• Try searching by city, landmark, or hotel name</Text>
        <Text style={styles.tipText}>• Book 2-3 weeks in advance for better rates</Text>
        <Text style={styles.tipText}>• Check different check-in days for price variations</Text>
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
    fontSize: typography.fontSize.xxl,
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
  
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  dateColumn: {
    flex: 1,
  },
  
  numberRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  numberColumn: {
    flex: 1,
  },
  
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  buttonContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  
  searchButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
  },
  
  tipsContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
});

export default HotelSearchForm;
