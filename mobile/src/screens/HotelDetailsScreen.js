import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import services and components
import { hotelService } from '../services/hotelService';
import { Card, Button, LoadingSpinner } from '../components/common';
import { colors, typography, spacing, globalStyles } from '../styles/globalStyles';
import { formatDateForDisplay, calculateNights } from '../utils/dateUtils';

const HotelDetailsScreen = ({ navigation, route }) => {
  const { hotelId, hotelName, searchParams } = route.params;
  const insets = useSafeAreaInsets();
  
  // State
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Load hotel details and rooms
  const loadHotelData = async () => {
    try {
      setLoading(true);
      
      // Load hotel details
      const hotelResponse = await hotelService.getHotelDetails(hotelId);
      if (hotelResponse.success) {
        setHotel(hotelResponse.data);
      }

      // Load available rooms
      const roomsParams = {
        hotelId,
        checkInDate: searchParams?.checkInDate,
        checkOutDate: searchParams?.checkOutDate,
        guests: searchParams?.guests || 1,
        roomType: searchParams?.roomType,
      };
      
      const roomsResponse = await hotelService.getHotelRooms(roomsParams);
      if (roomsResponse.success) {
        setRooms(roomsResponse.data || []);
      }
      
    } catch (error) {
      console.error('Error loading hotel data:', error);
      Alert.alert('Error', 'Failed to load hotel details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadHotelData();
    setRefreshing(false);
  };

  // Load data on mount
  useEffect(() => {
    loadHotelData();
  }, [hotelId]);

  // Handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  // Handle booking
  const handleBookNow = () => {
    if (!selectedRoom) {
      Alert.alert('Select a Room', 'Please select a room to continue with booking.');
      return;
    }

    if (!searchParams?.checkInDate || !searchParams?.checkOutDate) {
      Alert.alert('Missing Dates', 'Please search with specific dates to book a room.');
      return;
    }

    navigation.navigate('Booking', {
      hotel,
      room: selectedRoom,
      searchParams,
    });
  };

  // Calculate total price
  const calculateTotalPrice = (room) => {
    if (!searchParams?.checkInDate || !searchParams?.checkOutDate) {
      return room.pricePerNight;
    }
    
    const nights = calculateNights(
      new Date(searchParams.checkInDate),
      new Date(searchParams.checkOutDate)
    );
    
    return room.pricePerNight * nights;
  };

  // Calculate nights
  const getNights = () => {
    if (!searchParams?.checkInDate || !searchParams?.checkOutDate) {
      return 1;
    }
    
    return calculateNights(
      new Date(searchParams.checkInDate),
      new Date(searchParams.checkOutDate)
    );
  };

  // Render room item
  const renderRoomItem = ({ item: room }) => {
    const isSelected = selectedRoom?.id === room.id;
    const totalPrice = calculateTotalPrice(room);
    const nights = getNights();
    
    return (
      <Card
        key={room.id.toString()}
        style={[
          styles.roomCard,
          isSelected && styles.roomCardSelected,
        ]}
        onPress={() => handleRoomSelect(room)}
      >
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <Text style={styles.roomType}>{room.roomType}</Text>
            <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
          </View>
          
          <View style={styles.roomSelection}>
            <View style={[
              styles.selectionIndicator,
              isSelected && styles.selectionIndicatorSelected,
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />
              )}
            </View>
          </View>
        </View>

        {room.description && (
          <Text style={styles.roomDescription}>{room.description}</Text>
        )}

        <View style={styles.roomDetails}>
          <View style={styles.roomMeta}>
            <View style={styles.roomMetaItem}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.roomMetaText}>
                Up to {room.capacity} guests
              </Text>
            </View>
            
            <View style={styles.roomMetaItem}>
              <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.roomMetaText}>{room.roomType}</Text>
            </View>
          </View>
        </View>

        <View style={styles.roomPricing}>
          <View style={styles.priceInfo}>
            <Text style={styles.pricePerNight}>
              ETB {room.pricePerNight.toLocaleString()}/night
            </Text>
            {nights > 1 && (
              <Text style={styles.totalPrice}>
                Total: ETB {totalPrice.toLocaleString()} ({nights} nights)
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.selectButton,
              isSelected && styles.selectButtonSelected,
            ]}
            onPress={() => handleRoomSelect(room)}
          >
            <Text style={[
              styles.selectButtonText,
              isSelected && styles.selectButtonTextSelected,
            ]}>
              {isSelected ? 'Selected' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <LoadingSpinner text="Loading hotel details..." />
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={globalStyles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={globalStyles.errorText}>
          Hotel details could not be loaded
        </Text>
        <Button title="Try Again" onPress={loadHotelData} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hotel Information */}
        <View style={styles.hotelSection}>
          <Card style={styles.hotelCard}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            
            <View style={styles.hotelLocation}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.hotelLocationText}>
                {hotel.address}, {hotel.city}
              </Text>
            </View>

            {hotel.rating && (
              <View style={styles.hotelRating}>
                <Ionicons name="star" size={16} color={colors.secondary} />
                <Text style={styles.hotelRatingText}>
                  {hotel.rating} out of 5
                </Text>
              </View>
            )}

            {hotel.description && (
              <Text style={styles.hotelDescription}>{hotel.description}</Text>
            )}

            {/* Contact Information */}
            {(hotel.phone || hotel.email) && (
              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>Contact Information</Text>
                
                {hotel.phone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.contactText}>{hotel.phone}</Text>
                  </View>
                )}
                
                {hotel.email && (
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.contactText}>{hotel.email}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <View style={styles.amenitiesSection}>
                <Text style={styles.amenitiesTitle}>Hotel Amenities</Text>
                <View style={styles.amenitiesList}>
                  {hotel.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Search Summary */}
        {searchParams && (
          <View style={styles.searchSummarySection}>
            <Card style={styles.searchSummaryCard}>
              <Text style={styles.searchSummaryTitle}>Your Search</Text>
              <View style={styles.searchSummaryDetails}>
                <View style={styles.searchSummaryItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={styles.searchSummaryText}>
                    {formatDateForDisplay(new Date(searchParams.checkInDate))} - {formatDateForDisplay(new Date(searchParams.checkOutDate))}
                  </Text>
                </View>
                
                <View style={styles.searchSummaryItem}>
                  <Ionicons name="people-outline" size={16} color={colors.primary} />
                  <Text style={styles.searchSummaryText}>
                    {searchParams.guests} {searchParams.guests === 1 ? 'guest' : 'guests'}
                  </Text>
                </View>
                
                <View style={styles.searchSummaryItem}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={styles.searchSummaryText}>
                    {getNights()} {getNights() === 1 ? 'night' : 'nights'}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Available Rooms */}
        <View style={styles.roomsSection}>
          <Text style={styles.roomsSectionTitle}>
            Available Rooms ({rooms.length})
          </Text>
          
          {rooms.length > 0 ? (
            <View style={styles.roomsList}>
              {rooms.map((room) => renderRoomItem({ item: room }))}
            </View>
          ) : (
            <Card style={styles.noRoomsCard}>
              <View style={styles.noRoomsContent}>
                <Ionicons name="bed-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.noRoomsTitle}>No rooms available</Text>
                <Text style={styles.noRoomsText}>
                  No rooms match your search criteria. Try adjusting your dates or guest count.
                </Text>
                <Button
                  title="Modify Search"
                  variant="outline"
                  onPress={() => navigation.goBack()}
                  style={styles.modifySearchButton}
                />
              </View>
            </Card>
          )}
        </View>

        {/* Booking Button - moved inside ScrollView */}
        {rooms.length > 0 && (
          <View style={styles.bookingSection}>
            <View style={styles.bookingInfo}>
              {selectedRoom ? (
                <View>
                  <Text style={styles.selectedRoomText}>
                    {selectedRoom.roomType} - Room {selectedRoom.roomNumber}
                  </Text>
                  <Text style={styles.selectedRoomPrice}>
                    ETB {calculateTotalPrice(selectedRoom).toLocaleString()}
                    {getNights() > 1 && (
                      <Text style={styles.nightsText}> ({getNights()} nights)</Text>
                    )}
                  </Text>
                </View>
              ) : (
                <Text style={styles.selectRoomPrompt}>Select a room to book</Text>
              )}
            </View>
            
            <Button
              title="Book Now"
              onPress={handleBookNow}
              disabled={!selectedRoom}
              style={styles.bookButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContainer: {
    flex: 1,
    paddingBottom: 120, // Space for the fixed footer
  },
  
  hotelSection: {
    padding: spacing.md,
  },
  
  hotelCard: {
    padding: spacing.lg,
  },
  
  hotelName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  hotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  hotelLocationText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  hotelRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  hotelRatingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  hotelDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },
  
  contactSection: {
    marginBottom: spacing.lg,
  },
  
  contactTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  contactText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  
  amenitiesSection: {
    marginBottom: spacing.md,
  },
  
  amenitiesTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: spacing.xs,
  },
  
  amenityText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  searchSummarySection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  
  searchSummaryCard: {
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
  },
  
  searchSummaryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textOnPrimary,
    marginBottom: spacing.sm,
  },
  
  searchSummaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  
  searchSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  searchSummaryText: {
    fontSize: typography.fontSize.sm,
    color: colors.textOnPrimary,
    marginLeft: spacing.xs,
  },
  
  roomsSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  
  roomsSectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  roomsList: {
    // No additional styles needed
  },
  
  roomCard: {
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  roomCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  roomInfo: {
    flex: 1,
  },
  
  roomType: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  roomNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  roomSelection: {
    alignItems: 'flex-end',
  },
  
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectionIndicatorSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  
  roomDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  
  roomDetails: {
    marginBottom: spacing.md,
  },
  
  roomMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  roomMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  roomMetaText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  roomPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  priceInfo: {
    flex: 1,
  },
  
  pricePerNight: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  
  totalPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  selectButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  
  selectButtonSelected: {
    backgroundColor: colors.primary,
  },
  
  selectButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  
  selectButtonTextSelected: {
    color: colors.textOnPrimary,
  },
  
  noRoomsCard: {
    padding: spacing.xl,
  },
  
  noRoomsContent: {
    alignItems: 'center',
  },
  
  noRoomsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  noRoomsText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },
  
  modifySearchButton: {
    minWidth: 150,
  },
  
  bookingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  bookingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  
  selectedRoomText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  
  selectedRoomPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  
  nightsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
  },
  
  selectRoomPrompt: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  bookButton: {
    minWidth: 120,
  },
});

export default HotelDetailsScreen;
