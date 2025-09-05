/**
 * Android-specific configuration for React Native optimizations
 * This file contains settings to improve Android performance and scrolling behavior
 */

import { Platform } from 'react-native';

export const ANDROID_OPTIMIZATIONS = {
  // Scroll optimization settings
  SCROLL: {
    // Lower throttle for more responsive scrolling
    EVENT_THROTTLE: 1,
    // Optimized deceleration rate
    DECELERATION_RATE: 0.85,
    // Disable over-scroll effects for better performance
    OVER_SCROLL_MODE: 'never',
    // Enable nested scrolling
    NESTED_SCROLL_ENABLED: true,
    // Disable clipped subviews to prevent rendering issues
    REMOVE_CLIPPED_SUBVIEWS: false,
    // Keyboard handling
    KEYBOARD_DISMISS_MODE: 'interactive',
    KEYBOARD_PERSIST_TAPS: 'handled',
    // Performance optimizations
    MAINTAIN_VISIBLE_CONTENT_POSITION: null,
    PERSISTENT_SCROLLBAR: false,
    FADING_EDGE_LENGTH: 0,
    SCROLLS_TO_TOP: false,
  },
  
  // Touch optimization settings
  TOUCH: {
    // Optimize active opacity for better touch feedback
    ACTIVE_OPACITY: 0.7,
    // Disable long press delay for better responsiveness
    DELAY_LONG_PRESS: 100,
    // Hit slop for better touch targets
    HIT_SLOP: { top: 10, bottom: 10, left: 10, right: 10 },
  },
  
  // Memory optimization settings
  MEMORY: {
    // Initial number of items to render
    INITIAL_NUM_TO_RENDER: 3,
    // Maximum number of items to render per batch
    MAX_TO_RENDER_PER_BATCH: 3,
    // Window size for virtualized lists
    WINDOW_SIZE: 5,
    // Update cell batch period
    UPDATE_CELLS_BATCH_PERIOD: 50,
  },
  
  // Performance flags
  PERFORMANCE: {
    // Enable hardware acceleration
    HARDWARE_ACCELERATED: true,
    // Render ahead for smoother scrolling
    RENDER_AHEAD: 250,
    // Use native driver when possible
    USE_NATIVE_DRIVER: true,
  }
};

/**
 * Get platform-specific scroll props for ScrollView/FlatList components
 */
export const getScrollProps = (customProps = {}) => {
  if (Platform.OS !== 'android') {
    return customProps;
  }
  
  return {
    scrollEventThrottle: ANDROID_OPTIMIZATIONS.SCROLL.EVENT_THROTTLE,
    decelerationRate: ANDROID_OPTIMIZATIONS.SCROLL.DECELERATION_RATE,
    overScrollMode: ANDROID_OPTIMIZATIONS.SCROLL.OVER_SCROLL_MODE,
    nestedScrollEnabled: ANDROID_OPTIMIZATIONS.SCROLL.NESTED_SCROLL_ENABLED,
    removeClippedSubviews: ANDROID_OPTIMIZATIONS.SCROLL.REMOVE_CLIPPED_SUBVIEWS,
    keyboardDismissMode: ANDROID_OPTIMIZATIONS.SCROLL.KEYBOARD_DISMISS_MODE,
    keyboardShouldPersistTaps: ANDROID_OPTIMIZATIONS.SCROLL.KEYBOARD_PERSIST_TAPS,
    maintainVisibleContentPosition: ANDROID_OPTIMIZATIONS.SCROLL.MAINTAIN_VISIBLE_CONTENT_POSITION,
    persistentScrollbar: ANDROID_OPTIMIZATIONS.SCROLL.PERSISTENT_SCROLLBAR,
    fadingEdgeLength: ANDROID_OPTIMIZATIONS.SCROLL.FADING_EDGE_LENGTH,
    scrollsToTop: ANDROID_OPTIMIZATIONS.SCROLL.SCROLLS_TO_TOP,
    showsVerticalScrollIndicator: false, // Hide for cleaner appearance on Android
    ...customProps,
  };
};

/**
 * Get platform-specific touch props for TouchableOpacity components
 */
export const getTouchProps = (customProps = {}) => {
  if (Platform.OS !== 'android') {
    return customProps;
  }
  
  return {
    activeOpacity: ANDROID_OPTIMIZATIONS.TOUCH.ACTIVE_OPACITY,
    delayLongPress: ANDROID_OPTIMIZATIONS.TOUCH.DELAY_LONG_PRESS,
    hitSlop: ANDROID_OPTIMIZATIONS.TOUCH.HIT_SLOP,
    ...customProps,
  };
};

/**
 * Get platform-specific FlatList props for better Android performance
 */
export const getFlatListProps = (customProps = {}) => {
  if (Platform.OS !== 'android') {
    return customProps;
  }
  
  return {
    ...getScrollProps(),
    initialNumToRender: ANDROID_OPTIMIZATIONS.MEMORY.INITIAL_NUM_TO_RENDER,
    maxToRenderPerBatch: ANDROID_OPTIMIZATIONS.MEMORY.MAX_TO_RENDER_PER_BATCH,
    windowSize: ANDROID_OPTIMIZATIONS.MEMORY.WINDOW_SIZE,
    updateCellsBatchingPeriod: ANDROID_OPTIMIZATIONS.MEMORY.UPDATE_CELLS_BATCH_PERIOD,
    getItemLayout: null, // Allow dynamic heights
    ...customProps,
  };
};

/**
 * Debug function to log Android optimization status
 */
export const logAndroidOptimizations = () => {
  if (Platform.OS === 'android' && __DEV__) {
    console.log('🤖 Android Optimizations Applied:', {
      scroll: ANDROID_OPTIMIZATIONS.SCROLL,
      touch: ANDROID_OPTIMIZATIONS.TOUCH,
      memory: ANDROID_OPTIMIZATIONS.MEMORY,
      performance: ANDROID_OPTIMIZATIONS.PERFORMANCE,
    });
  }
};

export default ANDROID_OPTIMIZATIONS;
