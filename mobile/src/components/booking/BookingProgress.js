import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../styles/globalStyles';

const BookingProgress = ({ 
  currentStep = 1,
  totalSteps = 3,
  steps = [],
  style = {}
}) => {
  // Default steps if none provided
  const defaultSteps = [
    { id: 1, title: 'Room Selection', icon: 'bed-outline' },
    { id: 2, title: 'Guest Details', icon: 'person-outline' },
    { id: 3, title: 'Confirmation', icon: 'checkmark-circle-outline' },
  ];

  const progressSteps = steps.length > 0 ? steps : defaultSteps;

  const renderStep = (step, index) => {
    const isActive = currentStep === step.id;
    const isCompleted = currentStep > step.id;
    const isLast = index === progressSteps.length - 1;

    return (
      <View key={step.id} style={styles.stepContainer}>
        <View style={styles.stepContent}>
          {/* Step Circle */}
          <View style={[
            styles.stepCircle,
            isActive && styles.activeStepCircle,
            isCompleted && styles.completedStepCircle
          ]}>
            {isCompleted ? (
              <Ionicons 
                name="checkmark" 
                size={16} 
                color={colors.white} 
              />
            ) : (
              <Ionicons 
                name={step.icon || 'ellipse'} 
                size={16} 
                color={isActive ? colors.white : colors.textSecondary} 
              />
            )}
          </View>

          {/* Step Label */}
          <Text style={[
            styles.stepLabel,
            isActive && styles.activeStepLabel,
            isCompleted && styles.completedStepLabel
          ]}>
            {step.title}
          </Text>
        </View>

        {/* Connecting Line */}
        {!isLast && (
          <View style={[
            styles.stepLine,
            (isActive || isCompleted) && styles.activeStepLine
          ]} />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.progressContainer}>
        {progressSteps.map(renderStep)}
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View style={[
            styles.progressBarFill,
            { width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }
          ]} />
        </View>
      </View>

      {/* Step Counter */}
      <Text style={styles.stepCounter}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  activeStepCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  completedStepCircle: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
    maxWidth: 80,
  },
  activeStepLabel: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  completedStepLabel: {
    color: colors.success,
    fontWeight: typography.fontWeight.semiBold,
  },
  stepLine: {
    position: 'absolute',
    top: 16, // Half the height of the step circle
    left: '60%',
    right: '-60%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  activeStepLine: {
    backgroundColor: colors.primary,
  },
  progressBarContainer: {
    marginBottom: spacing.sm,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
});

export default BookingProgress;
