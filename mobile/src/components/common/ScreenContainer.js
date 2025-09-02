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

    return (
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
  },
  
  keyboardContainer: {
    flex: 1,
  },
  
  contentPadding: {
    paddingHorizontal: 16,
  },
});

export default ScreenContainer;
