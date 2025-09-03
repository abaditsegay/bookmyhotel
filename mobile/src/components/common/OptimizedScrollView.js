import React from 'react';
import {
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';

/**
 * OptimizedScrollView component with Android-specific optimizations
 * Addresses common Android scrolling issues:
 * - Scroll performance
 * - Nested scrolling conflicts
 * - Touch response issues
 * - Memory optimization
 */
const OptimizedScrollView = ({
  children,
  style,
  contentContainerStyle,
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  nestedScrollEnabled = true,
  scrollEnabled = true,
  keyboardShouldPersistTaps = 'handled',
  removeClippedSubviews,
  scrollEventThrottle,
  decelerationRate,
  overScrollMode,
  ...props
}) => {
  // Android-specific optimizations
  const androidOptimizations = Platform.OS === 'android' ? {
    // Improve scroll performance on Android
    scrollEventThrottle: scrollEventThrottle || 16,
    // Enable momentum scrolling
    decelerationRate: decelerationRate || (horizontal ? 'fast' : 'normal'),
    // Optimize memory usage for long lists
    removeClippedSubviews: removeClippedSubviews !== undefined ? removeClippedSubviews : true,
    // Handle overscroll behavior
    overScrollMode: overScrollMode || 'auto',
    // Improve nested scroll handling
    nestedScrollEnabled: true,
    // Optimize touch handling
    disableScrollViewPanResponder: false,
    // Improve responsiveness
    keyboardShouldPersistTaps: 'always',
  } : {};

  // iOS-specific optimizations
  const iosOptimizations = Platform.OS === 'ios' ? {
    // iOS handles these natively, but we can still optimize
    scrollEventThrottle: scrollEventThrottle || 1,
    decelerationRate: decelerationRate || 'normal',
    // iOS has better memory management, so we can be less aggressive
    removeClippedSubviews: removeClippedSubviews || false,
  } : {};

  const optimizedProps = {
    style: [styles.container, style],
    contentContainerStyle: [
      horizontal ? styles.horizontalContent : styles.verticalContent,
      contentContainerStyle,
    ],
    horizontal,
    showsVerticalScrollIndicator: horizontal ? false : showsVerticalScrollIndicator,
    showsHorizontalScrollIndicator: horizontal ? showsHorizontalScrollIndicator : false,
    nestedScrollEnabled,
    scrollEnabled,
    keyboardShouldPersistTaps,
    ...androidOptimizations,
    ...iosOptimizations,
    ...props,
  };

  return (
    <ScrollView {...optimizedProps}>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  verticalContent: {
    flexGrow: 1,
    ...(Platform.OS === 'android' && {
      // Android-specific content optimizations
      minHeight: '100%',
    }),
  },
  
  horizontalContent: {
    ...(Platform.OS === 'android' && {
      // Android-specific horizontal scroll optimizations
      alignItems: 'center',
    }),
  },
});

export default OptimizedScrollView;
