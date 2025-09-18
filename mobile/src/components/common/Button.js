import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/globalStyles';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Size styles
    if (size === 'small') {
      baseStyle.push(styles.buttonSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.buttonLarge);
    }
    
    // Variant styles
    if (variant === 'secondary') {
      baseStyle.push(styles.buttonSecondary);
    } else if (variant === 'outline') {
      baseStyle.push(styles.buttonOutline);
    } else if (variant === 'text') {
      baseStyle.push(styles.buttonText);
    }
    
    // State styles
    if (disabled) {
      baseStyle.push(styles.buttonDisabled);
    }
    
    // Custom style
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.buttonTextBase];
    
    // Size styles
    if (size === 'small') {
      baseTextStyle.push(styles.buttonTextSmall);
    } else if (size === 'large') {
      baseTextStyle.push(styles.buttonTextLarge);
    }
    
    // Variant styles
    if (variant === 'secondary') {
      baseTextStyle.push(styles.buttonTextSecondary);
    } else if (variant === 'outline') {
      baseTextStyle.push(styles.buttonTextOutline);
    } else if (variant === 'text') {
      baseTextStyle.push(styles.buttonTextOnly);
    }
    
    // State styles
    if (disabled) {
      baseTextStyle.push(styles.buttonTextDisabled);
    }
    
    // Custom text style
    if (textStyle) {
      baseTextStyle.push(textStyle);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? colors.textOnPrimary : colors.primary} 
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
  
  // Size variants
  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  
  buttonLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  
  // Style variants
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  buttonText: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  
  // State variants
  buttonDisabled: {
    backgroundColor: colors.lightGray,
  },
  
  // Text styles
  buttonTextBase: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textOnPrimary,
  },
  
  // Text size variants
  buttonTextSmall: {
    fontSize: typography.fontSize.sm,
  },
  
  buttonTextLarge: {
    fontSize: typography.fontSize.lg,
  },
  
  // Text style variants
  buttonTextSecondary: {
    color: colors.textOnSecondary,
  },
  
  buttonTextOutline: {
    color: colors.primary,
  },
  
  buttonTextOnly: {
    color: colors.primary,
  },
  
  // Text state variants
  buttonTextDisabled: {
    color: colors.textDisabled,
  },
  
  // Button content container
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Icon container with spacing
  iconContainer: {
    marginRight: spacing.sm,
  },
});

export default Button;
