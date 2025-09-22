import React, { useState, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, Platform, Pressable, Keyboard } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/globalStyles';

/**
 * Mobile-optimized input component with proper focus management for iOS and Android
 * Follows platform-specific UI guidelines and prevents focus loss issues
 */
const MobileInput = forwardRef(({
  label,
  placeholder,
  value = '',
  onChangeText,
  error,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  secureTextEntry = false,
  editable = true,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  onSubmitEditing,
  returnKeyType = 'done',
  blurOnSubmit = true,
  clearButtonMode = 'while-editing',
  maxLength,
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const textInputRef = useRef(null);

  // Expose imperative methods to parent components
  useImperativeHandle(ref, () => ({
    focus: () => textInputRef.current?.focus(),
    blur: () => textInputRef.current?.blur(),
    clear: () => textInputRef.current?.clear(),
    isFocused: () => textInputRef.current?.isFocused(),
  }), []);

  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  // Stable change handler to prevent focus loss
  const handleChangeText = useCallback((text) => {
    // Validate max length
    if (maxLength && text.length > maxLength) {
      return;
    }
    onChangeText?.(text);
  }, [onChangeText, maxLength]);

  const handleSubmitEditing = useCallback((e) => {
    if (blurOnSubmit) {
      textInputRef.current?.blur();
    }
    onSubmitEditing?.(e);
  }, [onSubmitEditing, blurOnSubmit]);

  // Handle container press to focus input
  const handleContainerPress = useCallback(() => {
    if (editable) {
      textInputRef.current?.focus();
    }
  }, [editable]);

  // Memoized styles for performance
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

  const inputTextStyle = useMemo(() => {
    const baseStyle = [styles.input];
    
    if (multiline) {
      baseStyle.push(styles.inputMultiline);
    }
    
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
  }, [multiline, leftIcon, rightIcon, inputStyle]);

  // Platform-specific accessibility props
  const accessibilityProps = useMemo(() => ({
    accessible,
    accessibilityLabel: accessibilityLabel || label,
    accessibilityHint,
    testID,
    ...(Platform.OS === 'ios' && {
      accessibilityRole: 'textbox',
    }),
    ...(Platform.OS === 'android' && {
      accessibilityComponentType: 'textfield',
    }),
  }), [accessible, accessibilityLabel, label, accessibilityHint, testID]);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <Pressable 
        style={inputContainerStyle}
        onPress={handleContainerPress}
        disabled={!editable}
      >
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
          value={value}
          onChangeText={handleChangeText}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmitEditing}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          maxLength={maxLength}
          {...(Platform.OS === 'ios' && {
            clearButtonMode,
          })}
          {...accessibilityProps}
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </Pressable>
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
      
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
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
    minHeight: Platform.OS === 'ios' ? 44 : 48, // iOS HIG minimum
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
  },
  
  inputIOS: {
    // iOS-specific adjustments
    lineHeight: Platform.OS === 'ios' ? 20 : undefined,
  },
  
  inputAndroid: {
    // Android-specific adjustments
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  
  inputMultiline: {
    paddingTop: spacing.md,
    textAlignVertical: 'top',
    minHeight: 80,
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
  
  characterCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});

MobileInput.displayName = 'MobileInput';

export default MobileInput;
