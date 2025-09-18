import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/globalStyles';

const Card = ({
  children,
  title,
  subtitle,
  onPress,
  style,
  headerStyle,
  contentStyle,
  elevation = 'medium',
  ...props
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    // Elevation/shadow styles
    if (elevation === 'small') {
      baseStyle.push(shadows.small);
    } else if (elevation === 'large') {
      baseStyle.push(shadows.large);
    } else {
      baseStyle.push(shadows.medium);
    }
    
    // Custom style
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const CardContent = () => (
    <View style={getCardStyle()} {...props}>
      {(title || subtitle) && (
        <View style={[styles.header, headerStyle]}>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      )}
      
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  
  header: {
    marginBottom: spacing.sm,
  },
  
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  content: {
    // No default styles for content, fully customizable
  },
});

export default Card;
