import React, { useRef, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing } from '../../styles/globalStyles';

const LoadingSpinner = ({ 
  text = 'Loading...', 
  size = 'large', 
  color = colors.primary,
  showText = true,
  style,
  fadeIn = true 
}) => {
  const fadeAnim = useRef(new Animated.Value(fadeIn ? 0 : 1)).current;

  useEffect(() => {
    if (fadeIn) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim, fadeIn]);

  return (
    <Animated.View style={[
      styles.container,
      { opacity: fadeAnim },
      style
    ]}>
      <ActivityIndicator 
        size={size} 
        color={color}
        style={styles.spinner}
      />
      {showText && text && (
        <Text style={[styles.text, { color }]}>{text}</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  spinner: {
    marginBottom: spacing.sm,
  },
  
  text: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default LoadingSpinner;
