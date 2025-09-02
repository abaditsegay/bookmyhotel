import { StyleSheet, Dimensions } from 'react-native';

// Get device dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Color palette
export const colors = {
  // Primary colors
  primary: '#1976d2',
  primaryLight: '#42a5f5',
  primaryDark: '#1565c0',
  
  // Secondary colors
  secondary: '#ff9800',
  secondaryLight: '#ffb74d',
  secondaryDark: '#f57c00',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray: '#9e9e9e',
  lightGray: '#f5f5f5',
  darkGray: '#424242',
  
  // Status colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Background colors
  background: '#fafafa',
  surface: '#ffffff',
  card: '#ffffff',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#bdbdbd',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#000000',
  
  // Border colors
  border: '#e0e0e0',
  divider: '#e0e0e0',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdropLight: 'rgba(0, 0, 0, 0.1)',
  backdropDark: 'rgba(0, 0, 0, 0.7)',
};

// Typography
export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
};

// Shadows
export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Global styles
export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  contentContainer: {
    flexGrow: 1,
    padding: spacing.md,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  
  // Scrollable containers
  scrollContainer: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  
  scrollContentWithPadding: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  // Keyboard avoiding container
  keyboardContainer: {
    flex: 1,
  },
  
  // Header styles
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textOnPrimary,
    textAlign: 'center',
  },
  
  headerSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textOnPrimary,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.medium,
  },
  
  cardLarge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.medium,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  // Section styles
  section: {
    marginVertical: spacing.md,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  // Text styles
  heading1: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.xxxl * typography.lineHeight.tight,
  },
  
  heading2: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
  },
  
  heading3: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
  },
  
  bodyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.md * typography.lineHeight.normal,
  },
  
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  
  // Button styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textOnPrimary,
  },
  
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  buttonSecondaryText: {
    color: colors.primary,
  },
  
  buttonDisabled: {
    backgroundColor: colors.lightGray,
  },
  
  buttonDisabledText: {
    color: colors.textDisabled,
  },
  
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  
  inputFocused: {
    borderColor: colors.primary,
  },
  
  inputError: {
    borderColor: colors.error,
  },
  
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  inputErrorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Spacing styles
  marginVerticalSm: {
    marginVertical: spacing.sm,
  },
  
  marginVerticalMd: {
    marginVertical: spacing.md,
  },
  
  marginVerticalLg: {
    marginVertical: spacing.lg,
  },
  
  paddingVerticalSm: {
    paddingVertical: spacing.sm,
  },
  
  paddingVerticalMd: {
    paddingVertical: spacing.md,
  },
  
  paddingVerticalLg: {
    paddingVertical: spacing.lg,
  },
  
  // Utility styles
  hidden: {
    display: 'none',
  },
  
  absolute: {
    position: 'absolute',
  },
  
  relative: {
    position: 'relative',
  },
  
  zIndex1: {
    zIndex: 1,
  },
  
  zIndex2: {
    zIndex: 2,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});

// Device dimensions
export const dimensions = {
  screenWidth,
  screenHeight,
  isSmallDevice: screenWidth < 375,
  isMediumDevice: screenWidth >= 375 && screenWidth < 414,
  isLargeDevice: screenWidth >= 414,
};
