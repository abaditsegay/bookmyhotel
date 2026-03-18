import React, { useState, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, TextInput, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/globalStyles';

/**
 * Mobile-optimized number input with formatting and validation
 * Supports different number types: integer, decimal, currency, phone
 */
const MobileNumberInput = forwardRef(({
  label,
  placeholder,
  value = '',
  onChangeText,
  error,
  numberType = 'decimal', // 'integer', 'decimal', 'currency', 'phone'
  currencySymbol = '$',
  decimalPlaces = 2,
  maxValue,
  minValue = 0,
  allowNegative = false,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  editable = true,
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(formatDisplayValue(value, numberType, currencySymbol));
  const textInputRef = useRef(null);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    focus: () => textInputRef.current?.focus(),
    blur: () => textInputRef.current?.blur(),
    clear: () => {
      setDisplayValue('');
      onChangeText?.('');
    },
    isFocused: () => textInputRef.current?.isFocused(),
  }), [onChangeText]);

  // Format value for display
  function formatDisplayValue(val, type, symbol) {
    if (!val) return '';
    
    const numericValue = parseFloat(val.toString().replace(/[^0-9.-]/g, ''));
    if (isNaN(numericValue)) return '';
    
    switch (type) {
      case 'integer':
        return Math.floor(numericValue).toString();
      
      case 'decimal':
        return numericValue.toFixed(decimalPlaces);
      
      case 'currency':
        return `${symbol}${numericValue.toFixed(2)}`;
      
      case 'phone':
        return formatPhoneNumber(numericValue.toString());
      
      default:
        return numericValue.toString();
    }
  }

  // Format phone number (basic US format)
  function formatPhoneNumber(num) {
    const digits = num.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return digits;
  }

  // Extract numeric value from formatted string
  function extractNumericValue(formattedValue, type) {
    if (!formattedValue) return '';
    
    if (type === 'phone') {
      return formattedValue.replace(/\D/g, '');
    }
    
    const cleaned = formattedValue.replace(/[^0-9.-]/g, '');
    const numericValue = parseFloat(cleaned);
    
    if (isNaN(numericValue)) return '';
    
    // Apply constraints
    let constrainedValue = numericValue;
    
    if (!allowNegative && constrainedValue < 0) {
      constrainedValue = 0;
    }
    
    if (minValue !== undefined && constrainedValue < minValue) {
      constrainedValue = minValue;
    }
    
    if (maxValue !== undefined && constrainedValue > maxValue) {
      constrainedValue = maxValue;
    }
    
    return constrainedValue.toString();
  }

  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    
    // Format the final value on blur
    const numericValue = extractNumericValue(displayValue, numberType);
    const formatted = formatDisplayValue(numericValue, numberType, currencySymbol);
    setDisplayValue(formatted);
    
    onBlur?.(e);
  }, [onBlur, displayValue, numberType, currencySymbol]);

  const handleChangeText = useCallback((text) => {
    // Allow editing without immediate formatting constraints
    if (numberType === 'phone') {
      const formatted = formatPhoneNumber(text);
      setDisplayValue(formatted);
      const numeric = extractNumericValue(formatted, numberType);
      onChangeText?.(numeric);
    } else {
      // For other number types, allow free editing during input
      setDisplayValue(text);
      const numeric = extractNumericValue(text, numberType);
      onChangeText?.(numeric);
    }
  }, [onChangeText, numberType]);

  // Get keyboard type based on number type
  const keyboardType = useMemo(() => {
    switch (numberType) {
      case 'integer':
        return 'number-pad';
      case 'decimal':
      case 'currency':
        return 'decimal-pad';
      case 'phone':
        return 'phone-pad';
      default:
        return 'numeric';
    }
  }, [numberType]);

  // Container styles
  const inputContainerStyle = useMemo(() => {
    const baseStyle = [styles.inputContainer];
    
    if (isFocused) {
      baseStyle.push(styles.inputContainerFocused);
    }
    
    if (error) {
      baseStyle.push(styles.inputContainerError);
    }
    
    if (!editable) {
      baseStyle.push(styles.inputContainerDisabled);
    }
    
    if (Platform.OS === 'ios') {
      baseStyle.push(styles.inputContainerIOS);
    } else {
      baseStyle.push(styles.inputContainerAndroid);
    }
    
    return baseStyle;
  }, [isFocused, error, editable]);

  // Input text styles
  const inputTextStyle = useMemo(() => {
    const baseStyle = [styles.input];
    
    if (leftIcon) {
      baseStyle.push(styles.inputWithLeftIcon);
    }
    
    if (rightIcon) {
      baseStyle.push(styles.inputWithRightIcon);
    }
    
    if (Platform.OS === 'ios') {
      baseStyle.push(styles.inputIOS);
    } else {
      baseStyle.push(styles.inputAndroid);
    }
    
    return [baseStyle, inputStyle];
  }, [leftIcon, rightIcon, inputStyle]);

  // Update display value when external value changes
  React.useEffect(() => {
    if (!isFocused) {
      const formatted = formatDisplayValue(value, numberType, currencySymbol);
      setDisplayValue(formatted);
    }
  }, [value, numberType, currencySymbol, isFocused]);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={textInputRef}
          style={inputTextStyle}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          value={displayValue}
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="done"
          blurOnSubmit={true}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          testID={testID}
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
      
      {/* Value constraints display */}
      {(minValue !== undefined || maxValue !== undefined) && (
        <Text style={styles.constraintText}>
          {minValue !== undefined && maxValue !== undefined
            ? `Range: ${minValue} - ${maxValue}`
            : minValue !== undefined
            ? `Minimum: ${minValue}`
            : `Maximum: ${maxValue}`
          }
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    minHeight: Platform.OS === 'ios' ? 44 : 48,
  },
  
  inputContainerIOS: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  inputContainerAndroid: {
    elevation: 1,
  },
  
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  
  inputContainerDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.6,
  },
  
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.md,
    paddingHorizontal: spacing.md,
    textAlign: 'right', // Right-align numbers
  },
  
  inputIOS: {
    lineHeight: 20,
  },
  
  inputAndroid: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  
  iconContainer: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  
  constraintText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});

MobileNumberInput.displayName = 'MobileNumberInput';

export default MobileNumberInput;
