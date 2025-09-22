import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard,
  StyleSheet 
} from 'react-native';
import { colors, spacing } from '../../styles/globalStyles';

/**
 * Mobile-optimized form container with keyboard management
 * Provides automatic keyboard avoidance and smooth scrolling
 */
const MobileFormContainer = ({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 64 : 0,
  enableAutomaticScroll = true,
  showsVerticalScrollIndicator = false,
  bounces = true,
  keyboardShouldPersistTaps = 'handled',
  onScroll,
  scrollEnabled = true,
  ...props
}) => {
  const scrollViewRef = useRef(null);
  const keyboardDidShowListener = useRef(null);
  const keyboardDidHideListener = useRef(null);

  // Keyboard event handlers
  const handleKeyboardDidShow = useCallback((e) => {
    if (enableAutomaticScroll && scrollViewRef.current) {
      // Optional: Scroll to focused input if needed
      // This would require additional focus tracking logic
    }
  }, [enableAutomaticScroll]);

  const handleKeyboardDidHide = useCallback(() => {
    // Optional: Reset scroll position or perform cleanup
  }, []);

  // Set up keyboard listeners
  useEffect(() => {
    if (Platform.OS === 'ios') {
      keyboardDidShowListener.current = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
      keyboardDidHideListener.current = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    } else {
      keyboardDidShowListener.current = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
      keyboardDidHideListener.current = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
    }

    return () => {
      keyboardDidShowListener.current?.remove();
      keyboardDidHideListener.current?.remove();
    };
  }, [handleKeyboardDidShow, handleKeyboardDidHide]);

  // Scroll to input helper function
  const scrollToInput = useCallback((inputY, inputHeight) => {
    if (scrollViewRef.current && enableAutomaticScroll) {
      const scrollOffset = inputY - (inputHeight * 2);
      scrollViewRef.current.scrollTo({
        y: Math.max(0, scrollOffset),
        animated: true,
      });
    }
  }, [enableAutomaticScroll]);

  // Memoized styles
  const containerStyle = useMemo(() => [
    styles.container,
    style,
  ], [style]);

  const contentStyle = useMemo(() => [
    styles.content,
    contentContainerStyle,
  ], [contentContainerStyle]);

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={containerStyle}
        {...props}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          bounces={bounces}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          onScroll={onScroll}
          scrollEnabled={scrollEnabled}
          automaticallyAdjustKeyboardInsets={true}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Android implementation
  return (
    <KeyboardAvoidingView
      behavior="height"
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={containerStyle}
      {...props}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        bounces={bounces}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        onScroll={onScroll}
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled={true}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Hook for managing form input refs and navigation
 */
export const useMobileForm = (inputCount = 0) => {
  const inputRefs = useRef([]);
  
  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, inputCount);
    for (let i = inputRefs.current.length; i < inputCount; i++) {
      inputRefs.current[i] = React.createRef();
    }
  }, [inputCount]);

  const focusInput = useCallback((index) => {
    if (inputRefs.current[index]?.current) {
      inputRefs.current[index].current.focus();
    }
  }, []);

  const focusNextInput = useCallback((currentIndex) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < inputRefs.current.length) {
      focusInput(nextIndex);
    } else {
      // Last input - blur to hide keyboard
      if (inputRefs.current[currentIndex]?.current) {
        inputRefs.current[currentIndex].current.blur();
      }
    }
  }, [focusInput]);

  const focusPreviousInput = useCallback((currentIndex) => {
    const previousIndex = currentIndex - 1;
    if (previousIndex >= 0) {
      focusInput(previousIndex);
    }
  }, [focusInput]);

  const blurAllInputs = useCallback(() => {
    inputRefs.current.forEach(ref => {
      if (ref?.current) {
        ref.current.blur();
      }
    });
    Keyboard.dismiss();
  }, []);

  return {
    inputRefs: inputRefs.current,
    focusInput,
    focusNextInput,
    focusPreviousInput,
    blurAllInputs,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl * 2 : spacing.xl,
  },
});

export default MobileFormContainer;
