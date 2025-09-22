import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, borderRadius } from '../../styles/globalStyles';

/**
 * Mobile-optimized date picker input with native platform integration
 * Provides consistent UX across iOS and Android
 */
const MobileDateInput = forwardRef(({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  placeholder = 'Select date',
  error,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  disabled = false,
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  displayFormat = 'MMM DD, YYYY',
  ...props
}, ref) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    open: () => setShowPicker(true),
    close: () => setShowPicker(false),
    focus: () => {
      setIsFocused(true);
      setShowPicker(true);
    },
    blur: () => {
      setIsFocused(false);
      setShowPicker(false);
    },
  }), []);

  const handlePress = useCallback(() => {
    if (!disabled) {
      setIsFocused(true);
      setShowPicker(true);
    }
  }, [disabled]);

  const handleDateChange = useCallback((event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      setIsFocused(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      onChange?.(selectedDate);
    }
    
    if (event.type === 'dismissed') {
      setIsFocused(false);
    }
  }, [onChange]);

  const handleIOSConfirm = useCallback(() => {
    setShowPicker(false);
    setIsFocused(false);
  }, []);

  const handleIOSCancel = useCallback(() => {
    setShowPicker(false);
    setIsFocused(false);
  }, []);

  // Format display value
  const displayValue = useMemo(() => {
    if (!value) {
      return '';
    }
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      // Simple formatting - can be enhanced with date-fns or moment
      const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      };
      
      if (mode === 'datetime') {
        options.hour = '2-digit';
        options.minute = '2-digit';
      } else if (mode === 'time') {
        delete options.year;
        delete options.month;
        delete options.day;
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return '';
    }
  }, [value, mode]);

  // Container styles
  const inputContainerStyle = useMemo(() => {
    const baseStyle = [styles.inputContainer];
    
    if (isFocused) {
      baseStyle.push(styles.inputContainerFocused);
    }
    
    if (error) {
      baseStyle.push(styles.inputContainerError);
    }
    
    if (disabled) {
      baseStyle.push(styles.inputContainerDisabled);
    }
    
    if (Platform.OS === 'ios') {
      baseStyle.push(styles.inputContainerIOS);
    } else {
      baseStyle.push(styles.inputContainerAndroid);
    }
    
    return baseStyle;
  }, [isFocused, error, disabled]);

  // Accessibility props
  const accessibilityProps = useMemo(() => ({
    accessible,
    accessibilityLabel: accessibilityLabel || label || 'Date picker',
    accessibilityHint: accessibilityHint || 'Tap to select a date',
    accessibilityRole: 'button',
    testID,
  }), [accessible, accessibilityLabel, label, accessibilityHint, testID]);

  // Render iOS modal
  const renderIOSPicker = () => {
    if (Platform.OS !== 'ios' || !showPicker) {
      return null;
    }

    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={showPicker}
        onRequestClose={handleIOSCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalButton}
                onPress={handleIOSCancel}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={styles.modalButton}
                onPress={handleIOSConfirm}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  Done
                </Text>
              </Pressable>
            </View>
            
            <DateTimePicker
              value={value || new Date()}
              mode={mode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              {...props}
            />
          </View>
        </View>
      </Modal>
    );
  };

  // Render Android picker
  const renderAndroidPicker = () => {
    if (Platform.OS !== 'android' || !showPicker) {
      return null;
    }

    return (
      <DateTimePicker
        value={value || new Date()}
        mode={mode}
        display="default"
        onChange={handleDateChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        {...props}
      />
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <Pressable
        style={inputContainerStyle}
        onPress={handlePress}
        disabled={disabled}
        {...accessibilityProps}
      >
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        
        <View style={[styles.input, inputStyle]}>
          <Text
            style={[
              styles.inputText,
              !displayValue && styles.placeholderText,
              disabled && styles.disabledText,
            ]}
          >
            {displayValue || placeholder}
          </Text>
        </View>
        
        {rightIcon && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
        
        {!rightIcon && (
          <View style={styles.iconContainer}>
            <Text style={styles.defaultIcon}>📅</Text>
          </View>
        )}
      </Pressable>
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
      
      {renderIOSPicker()}
      {renderAndroidPicker()}
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
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  
  inputText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    ...(Platform.OS === 'ios' && {
      lineHeight: 20,
    }),
  },
  
  placeholderText: {
    color: colors.textDisabled,
  },
  
  disabledText: {
    color: colors.textDisabled,
  },
  
  iconContainer: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  
  defaultIcon: {
    fontSize: 16,
  },
  
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  
  // iOS Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg, // Safe area bottom
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  
  modalButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },
  
  modalButtonTextConfirm: {
    fontWeight: typography.fontWeight.semibold,
  },
});

MobileDateInput.displayName = 'MobileDateInput';

export default MobileDateInput;
