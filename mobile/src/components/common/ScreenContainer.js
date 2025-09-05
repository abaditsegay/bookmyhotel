import React, { useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { colors, globalStyles } from '../../styles/globalStyles';

const { height: screenHeight } = Dimensions.get('window');

const ScreenContainer = ({
  children,
  style,
  contentContainerStyle,
  scrollable = true,
  keyboardAvoiding = false,
  refreshing = false,
  onRefresh,
  showsVerticalScrollIndicator = true,
  paddingHorizontal = true,
  backgroundColor = colors.background,
  safeArea = true,
  ...props
}) => {
  const scrollViewRef = useRef(null);

  const containerStyle = [
    styles.container,
    { backgroundColor },
    style,
  ];

  const contentStyle = [
    paddingHorizontal && styles.contentPadding,
    contentContainerStyle,
    // Ensure content has minimum height for proper scrolling
    { minHeight: screenHeight },
  ];

  // Optimize scroll handling for Android
  const handleScrollBeginDrag = useCallback(() => {
    if (Platform.OS === 'android' && scrollViewRef.current) {
      // Force focus clear on scroll start for Android
      scrollViewRef.current.setNativeProps({ scrollEnabled: true });
    }
  }, []);

  const renderContent = () => {
    if (!scrollable) {
      return (
        <View style={[styles.container, contentStyle]}>
          {children}
        </View>
      );
    }

    // Enhanced Android scrolling configuration
    const androidScrollProps = Platform.OS === 'android' ? {
      // Core Android optimizations
      overScrollMode: 'never',
      scrollEventThrottle: 1, // Lower value for more responsive scrolling
      removeClippedSubviews: false, // Disable to prevent rendering issues
      decelerationRate: 0.85, // Optimized deceleration for Android
      keyboardDismissMode: 'interactive',
      keyboardShouldPersistTaps: 'handled',
      
      // Enhanced touch handling
      disableScrollViewPanResponder: false,
      scrollsToTop: false,
      maintainVisibleContentPosition: null,
      
      // Performance optimizations
      persistentScrollbar: false,
      fadingEdgeLength: 0,
      
      // Touch optimization
      nestedScrollEnabled: true,
      scrollEnabled: true,
      
      // Gesture handling
      onScrollBeginDrag: handleScrollBeginDrag,
      
      // Content sizing
      contentInsetAdjustmentBehavior: 'automatic',
    } : {
      // iOS optimizations
      alwaysBounceVertical: true,
      bounces: true,
      bouncesZoom: false,
      scrollsToTop: true,
      showsVerticalScrollIndicator: showsVerticalScrollIndicator,
      decelerationRate: 'normal',
    };

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={Platform.OS === 'ios' ? showsVerticalScrollIndicator : false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        nestedScrollEnabled={true}
        refreshControl={
          onRefresh ? (
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={Platform.OS === 'android' ? [colors.primary] : undefined}
              tintColor={Platform.OS === 'ios' ? colors.primary : undefined}
            />
          ) : undefined
        }
        {...androidScrollProps}
        {...props}
      >
        {children}
      </ScrollView>
    );
  };

  const renderWithKeyboardAvoiding = (content) => {
    if (!keyboardAvoiding) {
      return content;
    }

    // Enhanced keyboard handling for Android
    const keyboardProps = Platform.select({
      ios: {
        behavior: 'padding',
        keyboardVerticalOffset: 0,
      },
      android: {
        behavior: 'height',
        keyboardVerticalOffset: -50, // Better offset for Android
        enabled: true,
      },
      default: {
        behavior: 'height',
        keyboardVerticalOffset: 20,
      }
    });

    return (
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        {...keyboardProps}
      >
        {content}
      </KeyboardAvoidingView>
    );
  };

  const renderWithSafeArea = (content) => {
    if (!safeArea) {
      return content;
    }

    // Platform-specific safe area handling
    const safeAreaStyle = Platform.select({
      ios: containerStyle,
      android: [containerStyle, { paddingTop: 0 }], // Android handles status bar differently
      default: containerStyle,
    });

    return (
      <SafeAreaView style={safeAreaStyle}>
        {content}
      </SafeAreaView>
    );
  };

  return renderWithSafeArea(
    renderWithKeyboardAvoiding(
      <View style={!safeArea ? containerStyle : styles.container}>
        {renderContent()}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
    // Platform-specific scroll view optimizations
    ...(Platform.OS === 'android' && {
      // Android-specific optimizations for better scrolling
      overflow: 'visible', // Changed from 'hidden' to prevent clipping
      flexGrow: 1,
    }),
    ...(Platform.OS === 'ios' && {
      overflow: 'visible',
    }),
    ...(Platform.OS === 'web' && {
      overflow: 'auto',
      height: '100vh',
    }),
  },
  
  keyboardContainer: {
    flex: 1,
    // Ensure keyboard container doesn't interfere with scrolling
    ...(Platform.OS === 'android' && {
      backgroundColor: 'transparent',
    }),
  },
  
  contentPadding: {
    paddingHorizontal: 16,
  },
});

export default ScreenContainer;
