import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../common';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/globalStyles';

const RoomComparison = ({ 
  visible = false,
  roomTypes = [],
  onClose,
  onSelectRoom,
  searchParams = {}
}) => {
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Calculate nights for pricing display
  const calculateNights = () => {
    if (!searchParams.checkInDate || !searchParams.checkOutDate) return 1;
    const checkIn = new Date(searchParams.checkInDate);
    const checkOut = new Date(searchParams.checkOutDate);
    return Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();

  const handleRoomSelect = useCallback((roomType) => {
    setSelectedRoom(roomType);
  }, []);

  const handleBookRoom = useCallback(() => {
    if (selectedRoom && onSelectRoom) {
      onSelectRoom(selectedRoom);
      onClose();
    }
  }, [selectedRoom, onSelectRoom, onClose]);

  const renderFeatureItem = (feature, index) => (
    <View key={index} style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  const renderRoomCard = ({ item: roomType }) => {
    const isSelected = selectedRoom?.roomType === roomType.roomType;
    const totalPrice = roomType.pricePerNight * nights;
    const isAvailable = roomType.availableCount > 0;

    return (
      <TouchableOpacity
        style={[
          styles.roomCard,
          isSelected && styles.selectedRoomCard,
          !isAvailable && styles.unavailableRoomCard
        ]}
        onPress={() => isAvailable && handleRoomSelect(roomType)}
        disabled={!isAvailable}
        activeOpacity={0.8}
      >
        {/* Room Header */}
        <View style={styles.roomHeader}>
          <View style={styles.roomTitleSection}>
            <Text style={[
              styles.roomTitle,
              !isAvailable && styles.unavailableText
            ]}>
              {roomType.roomType}
            </Text>
            <Text style={[
              styles.roomSubtitle,
              !isAvailable && styles.unavailableText
            ]}>
              {roomType.description || 'Standard Room'}
            </Text>
          </View>
          
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={20} color={colors.white} />
            </View>
          )}
        </View>

        {/* Room Details */}
        <View style={styles.roomDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              Max Guests: {roomType.maxGuests || 2}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="bed" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {roomType.bedConfiguration || 'Queen Bed'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="resize" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {roomType.roomSize || '25'} sq m
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons 
              name={isAvailable ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={isAvailable ? colors.success : colors.danger} 
            />
            <Text style={[
              styles.detailText,
              { color: isAvailable ? colors.success : colors.danger }
            ]}>
              {isAvailable 
                ? `${roomType.availableCount} rooms available`
                : 'Not available'
              }
            </Text>
          </View>
        </View>

        {/* Room Features */}
        {roomType.features && roomType.features.length > 0 && (
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Features</Text>
            <View style={styles.featuresList}>
              {roomType.features.slice(0, 4).map(renderFeatureItem)}
              {roomType.features.length > 4 && (
                <Text style={styles.moreFeatures}>
                  +{roomType.features.length - 4} more
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.priceBreakdown}>
            <Text style={styles.priceLabel}>Per night</Text>
            <Text style={[
              styles.pricePerNight,
              !isAvailable && styles.unavailableText
            ]}>
              ${roomType.pricePerNight}
            </Text>
          </View>
          
          {nights > 1 && (
            <View style={styles.totalPriceSection}>
              <Text style={styles.totalLabel}>
                Total for {nights} nights
              </Text>
              <Text style={[
                styles.totalPrice,
                !isAvailable && styles.unavailableText
              ]}>
                ${totalPrice}
              </Text>
            </View>
          )}
        </View>

        {/* Cancellation Policy */}
        <View style={styles.policySection}>
          <Ionicons name="shield-checkmark" size={14} color={colors.success} />
          <Text style={styles.policyText}>
            {roomType.cancellationPolicy || 'Free cancellation until 24h before'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bed-outline" size={48} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Rooms Available</Text>
      <Text style={styles.emptySubtitle}>
        Try changing your dates or search for different hotels.
      </Text>
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
          <Text style={styles.title}>Compare Rooms</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            {searchParams.checkInDate && searchParams.checkOutDate
              ? `${new Date(searchParams.checkInDate).toLocaleDateString()} - ${new Date(searchParams.checkOutDate).toLocaleDateString()}`
              : 'Select your dates'
            } • {searchParams.guests || 1} guest{(searchParams.guests || 1) > 1 ? 's' : ''}
          </Text>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {roomTypes.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={roomTypes}
              renderItem={renderRoomCard}
              keyExtractor={(item, index) => `room-${index}`}
              scrollEnabled={false}
              contentContainerStyle={styles.roomsList}
            />
          )}
        </ScrollView>

        {selectedRoom && (
          <View style={styles.footer}>
            <View style={styles.selectionSummary}>
              <Text style={styles.selectedRoomName}>
                {selectedRoom.roomType}
              </Text>
              <Text style={styles.selectedRoomPrice}>
                ${selectedRoom.pricePerNight * nights} total
              </Text>
            </View>
            <Button
              title="Continue with This Room"
              onPress={handleBookRoom}
              style={styles.continueButton}
            />
          </View>
        )}
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
  headerSpacer: {
    width: 40, // Same width as close button for centering
  },
  searchInfo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInfoText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.semiBold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  roomsList: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  roomCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  selectedRoomCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primaryLight,
  },
  unavailableRoomCard: {
    opacity: 0.6,
    backgroundColor: colors.lightGray,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  roomTitleSection: {
    flex: 1,
  },
  roomTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  roomSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  featuresSection: {
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  featuresTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  featuresList: {
    gap: spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  moreFeatures: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginLeft: spacing.xl,
    fontStyle: 'italic',
  },
  pricingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.sm,
  },
  priceBreakdown: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  pricePerNight: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  totalPriceSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  totalPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  policySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  policyText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  unavailableText: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.medium,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  selectedRoomName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  selectedRoomPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  continueButton: {
    marginTop: 0,
  },
});

export default RoomComparison;
