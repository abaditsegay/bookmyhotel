import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Input } from '../common';
import { colors, typography, spacing, borderRadius } from '../../styles/globalStyles';
import { validatePhone } from '../../utils/validation';

/**
 * Payment Method Selector Component
 * Supports Ethiopian payment methods including mobile money
 */
const PaymentMethodSelector = ({ 
  onSelect, 
  selectedMethod = 'cash',
  onPaymentDetailsChange,
  style = {}
}) => {
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Payment methods available in Ethiopia
  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash on Arrival',
      icon: 'cash-outline',
      description: 'Pay at the hotel reception upon check-in',
      color: colors.success,
      popular: true,
    },
    {
      id: 'telebirr',
      name: 'Telebirr',
      icon: 'phone-portrait-outline',
      description: 'Pay securely with Telebirr mobile money',
      color: '#FF6B00',
      requiresPhone: true,
      popular: true,
    },
    {
      id: 'cbe_birr',
      name: 'CBE Birr',
      icon: 'wallet-outline',
      description: 'Pay with Commercial Bank of Ethiopia Birr',
      color: '#1E5631',
      requiresPhone: true,
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: 'phone-portrait-outline',
      description: 'Pay with M-Pesa mobile money',
      color: '#00A651',
      requiresPhone: true,
    },
    {
      id: 'amole',
      name: 'Amole',
      icon: 'wallet-outline',
      description: 'Pay with Amole digital wallet',
      color: '#FF9500',
      requiresPhone: true,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'card-outline',
      description: 'International cards accepted (Visa, Mastercard)',
      color: colors.primary,
      comingSoon: true,
    },
  ];

  // Handle payment method selection
  const handleMethodSelect = useCallback((methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    
    if (method?.comingSoon) {
      Alert.alert(
        'Coming Soon',
        'This payment method will be available soon. Please select another option.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Clear phone error when switching methods
    setPhoneError('');
    
    onSelect(methodId);
    
    // Clear payment details if switching from a method that requires phone
    if (!method?.requiresPhone) {
      setMobileMoneyPhone('');
      onPaymentDetailsChange?.({});
    }
  }, [onSelect, onPaymentDetailsChange]);

  // Handle phone number input
  const handlePhoneChange = useCallback((text) => {
    setMobileMoneyPhone(text);
    setPhoneError('');
    
    // Validate and update payment details
    if (text.length >= 10) {
      if (validatePhone(text)) {
        onPaymentDetailsChange?.({
          phoneNumber: text,
          paymentMethod: selectedMethod,
        });
      } else {
        setPhoneError('Please enter a valid Ethiopian phone number');
      }
    }
  }, [selectedMethod, onPaymentDetailsChange]);

  // Get selected method details
  const selectedMethodDetails = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Method</Text>
        <Text style={styles.subtitle}>Choose how you'd like to pay</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                isSelected && styles.selectedCard,
                method.comingSoon && styles.disabledCard,
              ]}
              onPress={() => handleMethodSelect(method.id)}
              activeOpacity={0.7}
              disabled={method.comingSoon}
            >
              <View style={styles.methodContent}>
                <View style={styles.methodHeader}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: isSelected ? method.color : colors.lightGray }
                  ]}>
                    <Ionicons 
                      name={method.icon} 
                      size={24} 
                      color={isSelected ? colors.white : colors.textSecondary} 
                    />
                  </View>
                  
                  <View style={styles.methodInfo}>
                    <View style={styles.methodTitleRow}>
                      <Text style={[
                        styles.methodName,
                        isSelected && styles.selectedText
                      ]}>
                        {method.name}
                      </Text>
                      {method.popular && !method.comingSoon && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularText}>Popular</Text>
                        </View>
                      )}
                      {method.comingSoon && (
                        <View style={styles.comingSoonBadge}>
                          <Text style={styles.comingSoonText}>Soon</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.methodDescription}>{method.description}</Text>
                  </View>
                  
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected
                    ]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </View>

                {/* Phone number input for mobile money methods */}
                {method.requiresPhone && isSelected && (
                  <View style={styles.phoneInputContainer}>
                    <Input
                      label="Mobile Money Phone Number"
                      value={mobileMoneyPhone}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      placeholder="09XXXXXXXX or +251XXXXXXXXX"
                      leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
                      error={phoneError}
                      style={styles.phoneInput}
                      autoFocus={true}
                    />
                    <Text style={styles.phoneHint}>
                      You'll receive a payment prompt on your phone
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Payment security notice */}
      <View style={styles.securityNotice}>
        <Ionicons name="shield-checkmark" size={20} color={colors.success} />
        <Text style={styles.securityText}>
          All payments are secure and encrypted
        </Text>
      </View>

      {/* Selected method summary */}
      {selectedMethodDetails && !selectedMethodDetails.comingSoon && (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Payment:</Text>
            <Text style={styles.summaryValue}>{selectedMethodDetails.name}</Text>
          </View>
          {selectedMethodDetails.requiresPhone && mobileMoneyPhone && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phone Number:</Text>
              <Text style={styles.summaryValue}>{mobileMoneyPhone}</Text>
            </View>
          )}
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  methodCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight || '#E3F2FD',
  },
  disabledCard: {
    opacity: 0.6,
  },
  methodContent: {
    padding: spacing.md,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  methodName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  selectedText: {
    color: colors.primary,
  },
  methodDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  popularBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  comingSoonBadge: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  comingSoonText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  radioContainer: {
    marginLeft: spacing.sm,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  phoneInputContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  phoneInput: {
    marginBottom: spacing.xs,
  },
  phoneHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.successLight || '#E8F5E9',
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  securityText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  summaryCard: {
    marginTop: spacing.md,
    backgroundColor: colors.lightGray,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semiBold,
  },
});

export default PaymentMethodSelector;
