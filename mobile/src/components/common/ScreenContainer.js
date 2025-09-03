import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { colors, globalStyles } from '../../styles/globalStyles';

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
  const containerStyle = [
    styles.container,
    { backgroundColor },
    style,
  ];

  const contentStyle = [
    paddingHorizontal && styles.contentPadding,
    contentContainerStyle,
  ];

  const renderContent = () => {
    if (!scrollable) {
      return (
        <View style={[styles.container, contentStyle]}>
          {children}
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        nestedScrollEnabled={true}
        // Android-specific props for better scrolling
        overScrollMode="always"
        scrollEventThrottle={16}
        removeClippedSubviews={Platform.OS === 'android'}
        // Enable momentum scrolling for better UX
        decelerationRate="normal"
        // Android-specific touch handling fix
        {...(Platform.OS === 'android' && {
          alwaysBounceVertical: false,
          bounces: false,
        })}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
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

    // Android-specific keyboard handling optimizations
    const androidBehavior = Platform.OS === 'android' ? 'height' : 'padding';
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : Platform.OS === 'android' ? -200 : 20;

    return (
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={androidBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        enabled={Platform.OS !== 'android'} // Disable on Android since we use pan mode
      >
        {content}
      </KeyboardAvoidingView>
    );
  };

  const renderWithSafeArea = (content) => {
    if (!safeArea) {
      return content;
    }

    return (
      <SafeAreaView style={containerStyle}>
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
    ...(Platform.OS === 'android' && {
      // Android-specific optimizations
      overflowX: 'hidden',
      overflowY: 'auto',
    }),
    ...(Platform.OS === 'web' && {
      overflow: 'auto', // Enable web scrolling
      height: '100vh', // Full viewport height on web
    }),
  },
  
  keyboardContainer: {
    flex: 1,
  },
  
  contentPadding: {
    paddingHorizontal: 16,
  },
});

export default ScreenContainer;
