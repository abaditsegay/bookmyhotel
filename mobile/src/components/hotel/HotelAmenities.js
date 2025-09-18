import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common';
import { colors, typography, spacing, borderRadius } from '../../styles/globalStyles';

const HotelAmenities = ({ 
  amenities = [],
  style = {},
  showAll = false,
  onShowAll,
  maxVisible = 6
}) => {
  // Default amenities data structure with icons
  const amenityIcons = {
    // Common amenities
    'wifi': { icon: 'wifi', color: colors.info },
    'free-wifi': { icon: 'wifi', color: colors.info },
    'internet': { icon: 'wifi', color: colors.info },
    'pool': { icon: 'water', color: colors.primary },
    'swimming-pool': { icon: 'water', color: colors.primary },
    'gym': { icon: 'fitness', color: colors.danger },
    'fitness': { icon: 'fitness', color: colors.danger },
    'fitness-center': { icon: 'fitness', color: colors.danger },
    'spa': { icon: 'flower', color: colors.secondary },
    'restaurant': { icon: 'restaurant', color: colors.warning },
    'dining': { icon: 'restaurant', color: colors.warning },
    'parking': { icon: 'car', color: colors.textSecondary },
    'free-parking': { icon: 'car', color: colors.textSecondary },
    'air-conditioning': { icon: 'snow', color: colors.info },
    'ac': { icon: 'snow', color: colors.info },
    'room-service': { icon: 'time', color: colors.primary },
    '24h-service': { icon: 'time', color: colors.primary },
    'laundry': { icon: 'shirt', color: colors.secondary },
    'laundry-service': { icon: 'shirt', color: colors.secondary },
    'business': { icon: 'briefcase', color: colors.textPrimary },
    'business-center': { icon: 'briefcase', color: colors.textPrimary },
    'conference': { icon: 'people', color: colors.textPrimary },
    
    // Additional amenities
    'bar': { icon: 'wine', color: colors.warning },
    'lounge': { icon: 'wine', color: colors.warning },
    'concierge': { icon: 'person', color: colors.primary },
    'elevator': { icon: 'arrow-up', color: colors.textSecondary },
    'safe': { icon: 'lock-closed', color: colors.danger },
    'safety-deposit': { icon: 'lock-closed', color: colors.danger },
    'balcony': { icon: 'home', color: colors.success },
    'terrace': { icon: 'home', color: colors.success },
    'view': { icon: 'eye', color: colors.info },
    'city-view': { icon: 'eye', color: colors.info },
    'ocean-view': { icon: 'eye', color: colors.info },
    'mountain-view': { icon: 'eye', color: colors.info },
    'garden': { icon: 'leaf', color: colors.success },
    'garden-view': { icon: 'leaf', color: colors.success },
    'pets': { icon: 'paw', color: colors.warning },
    'pet-friendly': { icon: 'paw', color: colors.warning },
    'smoking': { icon: 'ban', color: colors.danger },
    'non-smoking': { icon: 'ban', color: colors.success },
    'family': { icon: 'people', color: colors.primary },
    'family-friendly': { icon: 'people', color: colors.primary },
    'kids': { icon: 'happy', color: colors.secondary },
    'playground': { icon: 'happy', color: colors.secondary },
    'beach': { icon: 'sunny', color: colors.warning },
    'beach-access': { icon: 'sunny', color: colors.warning },
    'shuttle': { icon: 'bus', color: colors.info },
    'airport-shuttle': { icon: 'airplane', color: colors.info },
    'pickup': { icon: 'car', color: colors.info },
    'heating': { icon: 'flame', color: colors.danger },
    'minibar': { icon: 'wine', color: colors.warning },
    'coffee': { icon: 'cafe', color: colors.textPrimary },
    'tea': { icon: 'cafe', color: colors.textPrimary },
    'kitchen': { icon: 'restaurant', color: colors.warning },
    'kitchenette': { icon: 'restaurant', color: colors.warning },
    'refrigerator': { icon: 'snow', color: colors.info },
    'microwave': { icon: 'radio', color: colors.textSecondary },
    'dishwasher': { icon: 'water', color: colors.info },
    'washing-machine': { icon: 'shirt', color: colors.secondary },
    'dryer': { icon: 'shirt', color: colors.secondary },
    'iron': { icon: 'shirt', color: colors.secondary },
    'hair-dryer': { icon: 'cut', color: colors.secondary },
    'tv': { icon: 'tv', color: colors.textPrimary },
    'cable': { icon: 'tv', color: colors.textPrimary },
    'satellite': { icon: 'tv', color: colors.textPrimary },
    'streaming': { icon: 'play', color: colors.primary },
    'netflix': { icon: 'play', color: colors.primary },
    'desk': { icon: 'briefcase', color: colors.textPrimary },
    'workspace': { icon: 'briefcase', color: colors.textPrimary },
  };

  // Process amenities to ensure consistent format
  const processedAmenities = amenities.map(amenity => {
    if (typeof amenity === 'string') {
      const key = amenity.toLowerCase().replace(/\s+/g, '-');
      const iconData = amenityIcons[key] || { icon: 'checkmark', color: colors.success };
      return {
        id: key,
        name: amenity,
        icon: iconData.icon,
        color: iconData.color,
      };
    }
    return {
      id: amenity.id || amenity.name.toLowerCase().replace(/\s+/g, '-'),
      name: amenity.name,
      icon: amenity.icon || 'checkmark',
      color: amenity.color || colors.success,
    };
  });

  // Determine which amenities to show
  const visibleAmenities = showAll 
    ? processedAmenities 
    : processedAmenities.slice(0, maxVisible);
  
  const hasMore = processedAmenities.length > maxVisible && !showAll;

  const renderAmenity = (amenity) => (
    <View key={amenity.id} style={styles.amenityItem}>
      <View style={[styles.amenityIcon, { backgroundColor: amenity.color }]}>
        <Ionicons name={amenity.icon} size={16} color={colors.white} />
      </View>
      <Text style={styles.amenityText}>{amenity.name}</Text>
    </View>
  );

  if (processedAmenities.length === 0) {
    return (
      <Card style={[styles.container, style]}>
        <Text style={styles.title}>Amenities</Text>
        <Text style={styles.noAmenitiesText}>
          No amenities information available
        </Text>
      </Card>
    );
  }

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Amenities ({processedAmenities.length})
        </Text>
        {hasMore && onShowAll && (
          <TouchableOpacity onPress={onShowAll} style={styles.showAllButton}>
            <Text style={styles.showAllText}>Show All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.amenitiesGrid}>
        {visibleAmenities.map(renderAmenity)}
      </View>

      {hasMore && !onShowAll && (
        <Text style={styles.moreAmenitiesText}>
          +{processedAmenities.length - maxVisible} more amenities
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  showAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
    marginRight: spacing.xs,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  amenityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  amenityText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  noAmenitiesText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    fontStyle: 'italic',
  },
  moreAmenitiesText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default HotelAmenities;
