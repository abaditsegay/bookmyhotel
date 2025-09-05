import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input } from '../common';
import { colors, typography, spacing, borderRadius } from '../../styles/globalStyles';
import { validateEmail, validatePhone } from '../../utils/validation';

const BookingForm = ({ 
  onSubmit,
  loading = false,
  initialData = {},
  style = {}
}) => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    specialRequests: initialData.specialRequests || '',
    arrivalTime: initialData.arrivalTime || '',
    purpose: initialData.purpose || '',
    ...initialData
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Form sections expanded state
  const [sectionsExpanded, setSectionsExpanded] = useState({
    contact: true,
    preferences: false,
    special: false,
  });

  // Arrival time options
  const arrivalTimes = [
    'Before 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM',
    'After 9:00 PM',
    'I\'ll call ahead',
  ];

  // Trip purpose options
  const purposeOptions = [
    'Leisure/Vacation',
    'Business Travel',
    'Family Visit',
    'Wedding/Event',
    'Conference/Meeting',
    'Medical/Health',
    'Other',
  ];

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Toggle section expansion
  const toggleSection = useCallback((section) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSubmit(formData);
    } else {
      Alert.alert('Form Incomplete', 'Please fill in all required fields correctly.');
    }
  }, [formData, validateForm, onSubmit]);

  // Memoized icons to prevent re-renders
  const icons = useMemo(() => ({
    person: <Ionicons name="person-outline" size={20} color={colors.textSecondary} />,
    mail: <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />,
    call: <Ionicons name="call-outline" size={20} color={colors.textSecondary} />,
    time: <Ionicons name="time-outline" size={20} color={colors.textSecondary} />,
    bookmark: <Ionicons name="bookmark-outline" size={20} color={colors.textSecondary} />,
    chatbox: <Ionicons name="chatbox-outline" size={20} color={colors.textSecondary} />,
  }), []);

  // Section header component
  const SectionHeader = ({ title, section, required = false }) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
      activeOpacity={0.7}
    >
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>
          {title}
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>
      </View>
      <Ionicons
        name={sectionsExpanded[section] ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );

  // Selection button component
  const SelectionButton = ({ options, selectedValue, onSelect, placeholder }) => (
    <View style={styles.selectionContainer}>
      <Text style={styles.selectionLabel}>{placeholder}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.optionsScroll}
        contentContainerStyle={styles.optionsContainer}
        // Android-specific optimizations for horizontal scroll
        nestedScrollEnabled={true}
        scrollEventThrottle={Platform.OS === 'android' ? 16 : undefined}
        decelerationRate={Platform.OS === 'android' ? 'fast' : 'normal'}
      >
        {options.map((option) => {
          const isSelected = selectedValue === option;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption
              ]}
              onPress={() => onSelect(option)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.optionText,
                isSelected && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      // Android-specific optimizations
      nestedScrollEnabled={true}
      scrollEventThrottle={Platform.OS === 'android' ? 16 : undefined}
      removeClippedSubviews={Platform.OS === 'android'}
      keyboardDismissMode={Platform.OS === 'android' ? 'on-drag' : 'interactive'}
      // Ensure smooth scrolling on Android
      overScrollMode={Platform.OS === 'android' ? 'never' : undefined}
    >
      {/* Contact Information */}
      <Card style={styles.section}>
        <SectionHeader title="Contact Information" section="contact" required />
        {sectionsExpanded.contact && (
          <View style={styles.sectionContent}>
            <View style={styles.nameRow}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => updateField('firstName', text)}
                leftIcon={icons.person}
                error={errors.firstName}
                style={[styles.nameInput, styles.nameInputLeft]}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => updateField('lastName', text)}
                error={errors.lastName}
                style={[styles.nameInput, styles.nameInputRight]}
                required
              />
            </View>
            
            <Input
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              leftIcon={icons.mail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />
            
            <Input
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              leftIcon={icons.call}
              keyboardType="phone-pad"
              error={errors.phone}
              required
            />
          </View>
        )}
      </Card>

      {/* Travel Preferences */}
      <Card style={styles.section}>
        <SectionHeader title="Travel Preferences" section="preferences" />
        {sectionsExpanded.preferences && (
          <View style={styles.sectionContent}>
            <SelectionButton
              options={arrivalTimes}
              selectedValue={formData.arrivalTime}
              onSelect={(value) => updateField('arrivalTime', value)}
              placeholder="Expected Arrival Time"
            />
            
            <SelectionButton
              options={purposeOptions}
              selectedValue={formData.purpose}
              onSelect={(value) => updateField('purpose', value)}
              placeholder="Purpose of Trip"
            />
          </View>
        )}
      </Card>

      {/* Special Requests */}
      <Card style={styles.section}>
        <SectionHeader title="Special Requests" section="special" />
        {sectionsExpanded.special && (
          <View style={styles.sectionContent}>
            <Input
              label="Special Requests or Comments"
              value={formData.specialRequests}
              onChangeText={(text) => updateField('specialRequests', text)}
              leftIcon={icons.chatbox}
              multiline
              numberOfLines={4}
              placeholder="Any special requests, accessibility needs, or preferences..."
              textAlignVertical="top"
              style={styles.textAreaInput}
            />
            
            <Text style={styles.helpText}>
              Examples: Extra pillows, late check-in, room on lower floor, dietary restrictions, etc.
            </Text>
          </View>
        )}
      </Card>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          title="Complete Booking"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
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
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  requiredAsterisk: {
    color: colors.danger,
    fontSize: typography.fontSize.md,
  },
  sectionContent: {
    paddingTop: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  nameInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  nameInputLeft: {
    marginRight: spacing.sm,
  },
  nameInputRight: {
    marginLeft: spacing.sm,
  },
  selectionContainer: {
    marginBottom: spacing.lg,
  },
  selectionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionsContainer: {
    paddingHorizontal: 0,
    gap: spacing.sm,
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  textAreaInput: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  submitContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: 0,
  },
});

export default BookingForm;
