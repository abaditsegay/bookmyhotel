import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services and components
import { hotelService } from '../services/hotelService';
import { Card, Button, LoadingSpinner, ScreenContainer } from '../components/common';
import { colors, typography, spacing, globalStyles } from '../styles/globalStyles';
import { formatDateForDisplay, calculateNights } from '../utils/dateUtils';

const HotelDetailsScreen = ({ navigation, route }) => {
  console.log('🚀 === HotelDetailsScreen RENDER START ===');
  console.log('📍 Route params:', route?.params);
  
  const { hotelId, hotelName, searchParams } = route.params;
  
  console.log('📍 Hotel ID:', hotelId);
  console.log('📍 Hotel Name:', hotelName);
  console.log('📍 Search Params:', searchParams);
  
  // State for hotel, room types, and UI  
  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]); // Room types instead of individual rooms
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null); // Selected room type instead of room

  // Load hotel details and room types
  const loadHotelData = async () => {
    try {
      console.log('🔄 loadHotelData started');
      setLoading(true);
      
      // Load hotel details with room type availability (desktop frontend approach)
      const hotelParams = {
        hotelId,
        checkInDate: searchParams?.checkInDate,
        checkOutDate: searchParams?.checkOutDate,
        guests: searchParams?.guests || 1,
        location: searchParams?.location,
      };
      
      console.log('🏨 Loading hotel details with room types for ID:', hotelId, 'params:', hotelParams);
      const hotelResponse = await hotelService.getHotelDetailsWithRoomTypes(hotelParams);
      console.log('🏨 Hotel response:', hotelResponse);
      
      if (hotelResponse.success) {
        setHotel(hotelResponse.data);
        console.log('✅ Hotel data set:', hotelResponse.data);
        
        // Extract room type availability from hotel response
        const roomTypeAvailability = hotelResponse.data?.roomTypeAvailability || [];
        console.log('🏠 Room types available:', roomTypeAvailability.length, 'types');
        console.log('🏠 Room types data:', roomTypeAvailability);
        setRoomTypes(roomTypeAvailability);
        
        // Auto-select first available room type if none selected
        if (roomTypeAvailability.length > 0 && !selectedRoomType) {
          const firstAvailable = roomTypeAvailability.find(rt => rt.availableCount > 0);
          if (firstAvailable) {
            setSelectedRoomType(firstAvailable);
            console.log('🎯 Auto-selected room type:', firstAvailable.roomType);
          }
        }
      } else {
        console.error('❌ Hotel request failed:', hotelResponse.error);
        Alert.alert('Error', hotelResponse.error || 'Failed to load hotel details');
      }
      
    } catch (error) {
      console.error('💥 Error loading hotel data:', error);
      Alert.alert('Error', 'Failed to load hotel details. Please try again.');
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
      console.log('🏁 loadHotelData completed');
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

  // Handle room type selection (following desktop frontend pattern)
  const handleRoomTypeSelect = (roomType) => {
    setSelectedRoomType(roomType);
    console.log('🎯 Selected room type:', roomType.roomType, 'Available:', roomType.availableCount);
  };

  // Handle booking (room type booking instead of specific room)
  const handleBookNow = () => {
    if (!selectedRoomType) {
      Alert.alert('Select a Room Type', 'Please select a room type to continue with booking.');
      return;
    }

    if (selectedRoomType.availableCount <= 0) {
      Alert.alert('Not Available', 'This room type is not available for the selected dates.');
      return;
    }
    if (!searchParams?.checkInDate || !searchParams?.checkOutDate) {
      Alert.alert('Missing Dates', 'Please search with specific dates to book a room type.');
      return;
    }

    // Navigate to booking with room type data (desktop frontend pattern)
    navigation.navigate('Booking', {
      hotel,
      roomType: selectedRoomType, // Pass room type instead of specific room
      searchParams,
    });
  };

  // Calculate total price for room type
  const calculateTotalPriceForRoomType = (roomType) => {
    if (!searchParams?.checkInDate || !searchParams?.checkOutDate) {
      return roomType.pricePerNight;
    }
    
    const nights = calculateNights(
      new Date(searchParams.checkInDate),
      new Date(searchParams.checkOutDate)
    );
    
    return roomType.pricePerNight * nights;
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

  // Render room type item (following desktop frontend pattern)
  const renderRoomTypeItem = ({ item: roomType }) => {
    const isSelected = selectedRoomType?.roomType === roomType.roomType;
    const totalPrice = calculateTotalPriceForRoomType(roomType);
    const nights = getNights();
    const isAvailable = roomType.availableCount > 0;
    
    return (
      <Card
        key={roomType.roomType}
        style={[
          styles.roomCard,
          isSelected && styles.roomCardSelected,
          !isAvailable && styles.roomCardDisabled,
        ]}
        onPress={() => isAvailable && handleRoomTypeSelect(roomType)}
        // Android-specific touch optimizations
        {...(Platform.OS === 'android' && {
          activeOpacity: 0.7,
          delayPressIn: 0,
        })}
      >
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <Text style={styles.roomType}>{roomType.roomTypeName || roomType.roomType}</Text>
            <Text style={styles.roomNumber}>{roomType.availableCount} available</Text>
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

        {/* Room Type Description */}
        {roomType.description && (
          <Text style={styles.roomDescription}>{roomType.description}</Text>
        )}

        {/* Room Type Details */}
        <View style={styles.roomDetails}>
          <View style={styles.roomMeta}>
            <View style={styles.roomMetaItem}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.roomMetaText}>
                Up to {roomType.capacity} guests
              </Text>
            </View>
            
            <View style={styles.roomMetaItem}>
              <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.roomMetaText}>{roomType.roomTypeName || roomType.roomType}</Text>
            </View>

            <View style={styles.roomMetaItem}>
              <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.roomMetaText}>
                {roomType.availableCount} available
              </Text>
            </View>
          </View>
        </View>

        {/* Room Type Pricing */}
        <View style={styles.roomPricing}>
          <View style={styles.priceInfo}>
            <Text style={styles.pricePerNight}>
              ETB {roomType.pricePerNight?.toLocaleString()}/night
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
              !isAvailable && styles.selectButtonDisabled,
            ]}
            onPress={() => isAvailable && handleRoomTypeSelect(roomType)}
            disabled={!isAvailable}
            // Android-specific touch optimizations
            {...(Platform.OS === 'android' && {
              activeOpacity: 0.8,
              delayPressIn: 0,
            })}
          >
            <Text style={[
              styles.selectButtonText,
              isSelected && styles.selectButtonTextSelected,
              !isAvailable && styles.selectButtonTextDisabled,
            ]}>
              {!isAvailable ? 'Unavailable' : isSelected ? 'Selected' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (loading) {
    console.log('⏳ Showing loading screen');
    return (
      <View style={globalStyles.loadingContainer}>
        <LoadingSpinner text="Loading hotel details..." />
      </View>
    );
  }

  if (!hotel) {
    console.log('❌ Showing error screen - no hotel data');
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

  console.log('✅ About to render hotel details. Hotel:', hotel?.name, 'Room Types:', roomTypes?.length);
  
  // Android-specific rendering with simplified scroll structure
  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.androidScrollView}
          contentContainerStyle={styles.androidContentContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={false}
          overScrollMode="auto"
          scrollEventThrottle={1}
          bounces={false}
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

          {/* Available Room Types - Android optimized */}
          <View style={styles.roomsSection}>
            <Text style={styles.roomsSectionTitle}>
              Available Room Types ({roomTypes.length})
            </Text>
            
            {roomTypes.length > 0 ? (
              <View style={styles.roomsListContainer}>
                {roomTypes.map((roomType, index) => (
                  <View key={roomType.roomType || roomType.id || index}>
                    {renderRoomTypeItem({ item: roomType })}
                  </View>
                ))}
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

          {/* Booking Button */}
          {roomTypes.length > 0 && (
            <View style={styles.bookingSection}>
              <View style={styles.bookingInfo}>
                {selectedRoomType ? (
                  <View>
                    <Text style={styles.selectedRoomText}>
                      {selectedRoomType.roomTypeName || selectedRoomType.roomType} ({selectedRoomType.availableCount} available)
                    </Text>
                    <Text style={styles.selectedRoomPrice}>
                      ETB {calculateTotalPriceForRoomType(selectedRoomType).toLocaleString()}
                      {getNights() > 1 && (
                        <Text style={styles.nightsText}> ({getNights()} nights)</Text>
                      )}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.selectRoomPrompt}>Select a room type to book</Text>
                )}
              </View>
              
              <Button
                title="Book Now"
                onPress={handleBookNow}
                disabled={!selectedRoomType || selectedRoomType.availableCount <= 0}
                style={styles.bookButton}
              />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
  
  // iOS rendering with ScreenContainer
  return (
    <ScreenContainer 
      scrollable={true}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={Platform.OS !== 'android'} // Hide on Android to prevent conflicts
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      // Android-specific overrides to fix scrolling issues
      {...(Platform.OS === 'android' && {
        nestedScrollEnabled: true,
        overScrollMode: 'auto',
        scrollEventThrottle: 1, // More responsive on Android
        removeClippedSubviews: false,
        disableScrollViewPanResponder: false, // Re-enable pan responder
        bounces: false, // Disable iOS-style bouncing on Android
      })}
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

        {/* Available Room Types */}
        <View style={styles.roomsSection}>
          <Text style={styles.roomsSectionTitle}>
            Available Room Types ({roomTypes.length})
          </Text>
          
          {roomTypes.length > 0 ? (
            Platform.OS === 'android' ? (
              // This code path won't be reached since Android has separate rendering above
              <View style={styles.roomsListContainer}>
                {roomTypes.map((roomType, index) => (
                  <View key={roomType.roomType || roomType.id || index}>
                    {renderRoomTypeItem({ item: roomType })}
                  </View>
                ))}
              </View>
            ) : (
              // iOS: Keep FlatList for better performance
              <FlatList
                data={roomTypes}
                renderItem={renderRoomTypeItem}
                keyExtractor={(item) => item.roomType || item.id}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={false}
                contentContainerStyle={styles.roomsListContainer}
              />
            )
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
        {roomTypes.length > 0 && (
          <View style={styles.bookingSection}>
            <View style={styles.bookingInfo}>
              {selectedRoomType ? (
                <View>
                  <Text style={styles.selectedRoomText}>
                    {selectedRoomType.roomTypeName || selectedRoomType.roomType} ({selectedRoomType.availableCount} available)
                  </Text>
                  <Text style={styles.selectedRoomPrice}>
                    ETB {calculateTotalPriceForRoomType(selectedRoomType).toLocaleString()}
                    {getNights() > 1 && (
                      <Text style={styles.nightsText}> ({getNights()} nights)</Text>
                    )}
                  </Text>
                </View>
              ) : (
                <Text style={styles.selectRoomPrompt}>Select a room type to book</Text>
              )}
            </View>
            
            <Button
              title="Book Now"
              onPress={handleBookNow}
              disabled={!selectedRoomType || selectedRoomType.availableCount <= 0}
              style={styles.bookButton}
            />
          </View>
        )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    height: '100%', // Ensure full height for web
  },
  
  // Android-specific styles
  androidScrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  androidContentContainer: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  
  contentContainer: {
    paddingBottom: spacing.xl,
    minHeight: Platform.OS === 'android' ? 'auto' : '100%', // Android-specific height handling
    flexGrow: 1, // Allow content to expand
  },
  
  hotelSection: {
    padding: spacing.md,
  },
  
  hotelCard: {
    ...globalStyles.cardLarge,
  },
  
  hotelName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  hotelLocation: {
    ...globalStyles.row,
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
  
  roomsListContainer: {
    paddingBottom: spacing.md,
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

  // Room type disabled states
  roomCardDisabled: {
    opacity: 0.6,
  },

  selectButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },

  selectButtonTextDisabled: {
    color: colors.textSecondary,
  },
});

export default HotelDetailsScreen;
