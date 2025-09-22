import React, { useState, useRef, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, TextInput, Text, StyleSheet, Platform, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/globalStyles';

/**
 * Mobile-optimized search input with debouncing and autocomplete
 * Prevents focus loss and provides smooth search experience
 */
const MobileSearchInput = forwardRef(({
  placeholder = 'Search...',
  value = '',
  onChangeText,
  onSearch,
  debounceMs = 300,
  showSuggestions = false,
  suggestions = [],
  onSuggestionPress,
  clearButtonMode = 'while-editing',
  style,
  inputStyle,
  suggestionStyle,
  leftIcon,
  rightIcon,
  maxSuggestions = 5,
  testID,
  accessible = true,
  accessibilityLabel = 'Search input',
  accessibilityHint = 'Enter text to search',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const textInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    focus: () => textInputRef.current?.focus(),
    blur: () => textInputRef.current?.blur(),
    clear: () => {
      onChangeText?.('');
      textInputRef.current?.clear();
    },
    isFocused: () => textInputRef.current?.isFocused(),
  }), [onChangeText]);

  // Debounced search function
  const debouncedSearch = useCallback((searchText) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onSearch?.(searchText);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  // Handle text change with debouncing
  const handleChangeText = useCallback((text) => {
    onChangeText?.(text);
    
    // Show/hide suggestions based on text length and focus
    if (showSuggestions && text.length > 0 && isFocused) {
      setShowSuggestionsList(true);
    } else {
      setShowSuggestionsList(false);
    }
    
    // Trigger debounced search
    debouncedSearch(text);
  }, [onChangeText, showSuggestions, isFocused, debouncedSearch]);

  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    
    // Show suggestions if there's text and suggestions are enabled
    if (showSuggestions && value.length > 0) {
      setShowSuggestionsList(true);
    }
  }, [showSuggestions, value]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    
    // Delay hiding suggestions to allow for suggestion selection
    setTimeout(() => {
      setShowSuggestionsList(false);
    }, 200);
  }, []);

  const handleSuggestionPress = useCallback((suggestion) => {
    onChangeText?.(suggestion);
    onSuggestionPress?.(suggestion);
    setShowSuggestionsList(false);
    textInputRef.current?.blur();
  }, [onChangeText, onSuggestionPress]);

  const handleClearPress = useCallback(() => {
    onChangeText?.('');
    setShowSuggestionsList(false);
    textInputRef.current?.focus();
  }, [onChangeText]);

  // Filter and limit suggestions
  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions || !value.trim()) {
      return [];
    }
    
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase()) &&
        suggestion.toLowerCase() !== value.toLowerCase()
      )
      .slice(0, maxSuggestions);
  }, [suggestions, value, showSuggestions, maxSuggestions]);

  // Container styles
  const inputContainerStyle = useMemo(() => {
    const baseStyle = [styles.inputContainer];
    
    if (isFocused) {
      baseStyle.push(styles.inputContainerFocused);
    }
    
    if (Platform.OS === 'ios') {
      baseStyle.push(styles.inputContainerIOS);
    } else {
      baseStyle.push(styles.inputContainerAndroid);
    }
    
    return baseStyle;
  }, [isFocused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const renderSuggestion = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, suggestionStyle]}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  ), [handleSuggestionPress, suggestionStyle]);

  return (
    <View style={[styles.container, style]}>
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={textInputRef}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || Platform.OS === 'ios') && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          blurOnSubmit={true}
          {...(Platform.OS === 'ios' && {
            clearButtonMode,
          })}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          testID={testID}
          {...props}
        />
        
        {/* Android clear button */}
        {Platform.OS === 'android' && value.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={handleClearPress}
            hitSlop={8}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}
        
        {rightIcon && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {/* Suggestions list */}
      {showSuggestionsList && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredSuggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `suggestion-${index}-${item}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    minHeight: Platform.OS === 'ios' ? 44 : 48,
  },
  
  inputContainerIOS: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  inputContainerAndroid: {
    elevation: 1,
  },
  
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.md,
    paddingHorizontal: spacing.md,
    ...(Platform.OS === 'ios' && {
      lineHeight: 20,
    }),
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
  
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  
  iconContainer: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  
  clearButton: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
    minHeight: 24,
  },
  
  clearButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    maxHeight: 200,
    zIndex: 1000,
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    }),
    ...(Platform.OS === 'android' && {
      elevation: 4,
    }),
  },
  
  suggestionsList: {
    flexGrow: 0,
  },
  
  suggestionItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  suggestionText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
});

MobileSearchInput.displayName = 'MobileSearchInput';

export default MobileSearchInput;
