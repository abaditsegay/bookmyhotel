import React, { forwardRef, useCallback, useRef, useEffect } from 'react';
import {
  ScrollView,
  Platform,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

/**
 * OptimizedScrollView component with enhanced Android-specific optimizations
 * Addresses common Android scrolling issues:
 * - Scroll performance and responsiveness
 * - Nested scrolling conflicts
 * - Touch response issues
 * - Memory optimization
 * - Tab navigation interference
 */
const OptimizedScrollView = forwardRef(({
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
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  refreshControl,
  ...props
}, ref) => {
  const scrollViewRef = useRef(ref);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  // Enhanced scroll event handling for Android
  const handleScroll = useCallback((event) => {
    if (Platform.OS === 'android') {
      // Clear any existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // Set scrolling state
      isScrolling.current = true;
      
      // Reset scrolling state after scroll ends
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    }
    
    onScroll?.(event);
  }, [onScroll]);

  const handleScrollBeginDrag = useCallback((event) => {
    if (Platform.OS === 'android') {
      isScrolling.current = true;
    }
    onScrollBeginDrag?.(event);
  }, [onScrollBeginDrag]);

  const handleScrollEndDrag = useCallback((event) => {
    onScrollEndDrag?.(event);
  }, [onScrollEndDrag]);

  const handleMomentumScrollBegin = useCallback((event) => {
    if (Platform.OS === 'android') {
      isScrolling.current = true;
    }
    onMomentumScrollBegin?.(event);
  }, [onMomentumScrollBegin]);

  const handleMomentumScrollEnd = useCallback((event) => {
    if (Platform.OS === 'android') {
      isScrolling.current = false;
    }
    onMomentumScrollEnd?.(event);
  }, [onMomentumScrollEnd]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Android-specific optimizations
  const androidOptimizations = Platform.OS === 'android' ? {
    // Core scroll performance optimizations
    scrollEventThrottle: scrollEventThrottle || 1, // More responsive
    decelerationRate: decelerationRate || 0.85, // Smoother deceleration
    
    // Memory and rendering optimizations
    removeClippedSubviews: removeClippedSubviews !== undefined ? removeClippedSubviews : false,
    
    // Overscroll behavior
    overScrollMode: overScrollMode || 'never',
    
    // Enhanced nested scroll support
    nestedScrollEnabled: true,
    
    // Touch and gesture optimizations
    keyboardShouldPersistTaps: 'handled',
    keyboardDismissMode: 'interactive',
    disableScrollViewPanResponder: false,
    
    // Performance optimizations
    maintainVisibleContentPosition: null,
    persistentScrollbar: false,
    fadingEdgeLength: 0,
    
    // Visual optimizations
    scrollsToTop: false,
    showsVerticalScrollIndicator: horizontal ? false : false, // Hide on Android for cleaner look
    showsHorizontalScrollIndicator: horizontal ? false : false,
    
    // Enhanced event handlers
    onScroll: handleScroll,
    onScrollBeginDrag: handleScrollBeginDrag,
    onScrollEndDrag: handleScrollEndDrag,
    onMomentumScrollBegin: handleMomentumScrollBegin,
    onMomentumScrollEnd: handleMomentumScrollEnd,
  } : {
    // iOS optimizations
    scrollEventThrottle: scrollEventThrottle || 16,
    decelerationRate: decelerationRate || 'normal',
    removeClippedSubviews: removeClippedSubviews || false,
    alwaysBounceVertical: !horizontal,
    bounces: true,
    scrollsToTop: !horizontal,
    showsVerticalScrollIndicator: horizontal ? false : showsVerticalScrollIndicator,
    showsHorizontalScrollIndicator: horizontal ? showsHorizontalScrollIndicator : false,
    
    // Standard event handlers
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
  };

  const optimizedProps = {
    ref: scrollViewRef,
    style: [styles.container, style],
    contentContainerStyle: [
      horizontal ? styles.horizontalContent : styles.verticalContent,
      contentContainerStyle,
      // Ensure proper content sizing for Android
      Platform.OS === 'android' && !horizontal && { minHeight: screenHeight + 50 },
    ],
    horizontal,
    nestedScrollEnabled,
    scrollEnabled,
    refreshControl,
    ...androidOptimizations,
    ...props,
  };

  return (
    <ScrollView {...optimizedProps}>
      {Platform.OS === 'android' ? (
        <View style={styles.androidContent}>
          {children}
          {/* Add padding at bottom for Android to ensure proper scrolling */}
          {!horizontal && <View style={styles.bottomPadding} />}
        </View>
      ) : (
        children
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'android' && {
      // Android-specific container optimizations
      backgroundColor: 'transparent',
    }),
  },
  
  verticalContent: {
    flexGrow: 1,
  },
  
  horizontalContent: {
    ...(Platform.OS === 'android' && {
      alignItems: 'center',
      paddingHorizontal: 4,
    }),
  },
  
  androidContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  bottomPadding: {
    height: 50,
    backgroundColor: 'transparent',
  },
});

OptimizedScrollView.displayName = 'OptimizedScrollView';

export default OptimizedScrollView;
