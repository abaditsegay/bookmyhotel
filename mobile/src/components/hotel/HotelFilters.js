import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Card, Button } from '../common';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/globalStyles';

const HotelFilters = ({ 
  visible, 
  onClose, 
  onApply, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState({
    priceRange: initialFilters.priceRange || [0, 500],
    starRating: initialFilters.starRating || 0,
    amenities: initialFilters.amenities || [],
    sortBy: initialFilters.sortBy || 'popularity',
    ...initialFilters
  });

  // Available amenities
  const availableAmenities = [
    { id: 'wifi', name: 'Free WiFi', icon: 'wifi' },
    { id: 'pool', name: 'Swimming Pool', icon: 'water' },
    { id: 'gym', name: 'Fitness Center', icon: 'fitness' },
    { id: 'spa', name: 'Spa', icon: 'flower' },
    { id: 'restaurant', name: 'Restaurant', icon: 'restaurant' },
    { id: 'parking', name: 'Free Parking', icon: 'car' },
    { id: 'ac', name: 'Air Conditioning', icon: 'snow' },
    { id: 'room-service', name: '24h Room Service', icon: 'time' },
    { id: 'laundry', name: 'Laundry Service', icon: 'shirt' },
    { id: 'business', name: 'Business Center', icon: 'briefcase' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Guest Rating' },
    { value: 'distance', label: 'Distance' },
  ];

  const handlePriceChange = useCallback((value, index) => {
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = Math.round(value);
    setFilters(prev => ({ ...prev, priceRange: newPriceRange }));
  }, [filters.priceRange]);

  const handleStarRating = useCallback((rating) => {
    setFilters(prev => ({ ...prev, starRating: rating }));
  }, []);

  const handleAmenityToggle = useCallback((amenityId) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    setFilters(prev => ({ ...prev, sortBy: sortValue }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      priceRange: [0, 500],
      starRating: 0,
      amenities: [],
      sortBy: 'popularity',
    });
  }, []);

  const handleApply = useCallback(() => {
    onApply(filters);
    onClose();
  }, [filters, onApply, onClose]);

  const renderStarRating = () => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          style={styles.starButton}
          onPress={() => handleStarRating(star)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= filters.starRating ? 'star' : 'star-outline'}
            size={24}
            color={star <= filters.starRating ? colors.secondary : colors.textSecondary}
          />
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.clearRatingButton}
        onPress={() => handleStarRating(0)}
      >
        <Text style={styles.clearRatingText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAmenities = () => (
    <View style={styles.amenitiesGrid}>
      {availableAmenities.map(amenity => {
        const isSelected = filters.amenities.includes(amenity.id);
        return (
          <TouchableOpacity
            key={amenity.id}
            style={[
              styles.amenityButton,
              isSelected && styles.amenityButtonSelected
            ]}
            onPress={() => handleAmenityToggle(amenity.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={amenity.icon}
              size={20}
              color={isSelected ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.amenityText,
              isSelected && styles.amenityTextSelected
            ]}>
              {amenity.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      {sortOptions.map(option => {
        const isSelected = filters.sortBy === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortOption,
              isSelected && styles.sortOptionSelected
            ]}
            onPress={() => handleSortChange(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.sortText,
              isSelected && styles.sortTextSelected
            ]}>
              {option.label}
            </Text>
            {isSelected && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Filters & Sort</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range (per night)</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={500}
                value={filters.priceRange[0]}
                onValueChange={(value) => handlePriceChange(value, 0)}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbStyle={styles.sliderThumb}
              />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={500}
                value={filters.priceRange[1]}
                onValueChange={(value) => handlePriceChange(value, 1)}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbStyle={styles.sliderThumb}
              />
            </View>
          </Card>

          {/* Star Rating */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Minimum Star Rating</Text>
            {renderStarRating()}
          </Card>

          {/* Amenities */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            {renderAmenities()}
          </Card>

          {/* Sort By */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            {renderSortOptions()}
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Apply Filters"
            onPress={handleApply}
            style={styles.applyButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  resetButton: {
    padding: spacing.xs,
  },
  resetText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginVertical: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  priceLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  sliderContainer: {
    marginTop: spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: spacing.xs,
  },
  sliderThumb: {
    backgroundColor: colors.primary,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starButton: {
    padding: spacing.xs,
  },
  clearRatingButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  clearRatingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenityButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  amenityText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  amenityTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  sortContainer: {
    gap: spacing.sm,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  sortText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  sortTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    marginTop: 0,
  },
});

export default HotelFilters;
