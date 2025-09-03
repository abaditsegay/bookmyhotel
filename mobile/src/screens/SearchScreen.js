import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePickerModal from '../components/DatePickerModal';
import { hotelService } from '../services/hotelService';
import { ScreenContainer, Input } from '../components/common';
import { colors, typography, spacing, globalStyles, borderRadius, shadows } from '../styles/globalStyles';

const SearchScreen = ({ navigation }) => {
  const [destination, setDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000)); // Next day
  const [guests, setGuests] = useState(2);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Memoized handlers to prevent re-renders
  const handleDestinationChange = useCallback((text) => {
    setDestination(text);
  }, []);

  const handleCheckInSelect = useCallback(() => {
    setShowCheckInPicker(true);
  }, []);

  const handleCheckOutSelect = useCallback(() => {
    setShowCheckOutPicker(true);
  }, []);

  const handleGuestSelect = useCallback(() => {
    setShowGuestPicker(!showGuestPicker);
  }, [showGuestPicker]);

  // Memoized icon components
  const LocationIcon = useMemo(() => <Ionicons name="location" size={20} color={colors.textSecondary} />, []);
  const PeopleIcon = useMemo(() => <Ionicons name="people" size={20} color={colors.textSecondary} />, []);

  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${month} ${day}`;
  };

  const handleDateChange = useCallback((selectedDate, type) => {
    if (selectedDate) {
      if (type === 'checkIn') {
        setCheckInDate(selectedDate);
        // Ensure check-out is after check-in
        if (selectedDate >= checkOutDate) {
          setCheckOutDate(new Date(selectedDate.getTime() + 86400000));
        }
      } else {
        setCheckOutDate(selectedDate);
      }
    }
  }, [checkOutDate]);

  const handleSearch = useCallback(async () => {
    if (!destination.trim()) {
      Alert.alert('Required', 'Please enter a destination');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const searchParams = {
        location: destination.trim(),
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        guests: guests,
      };

      console.log('🔍 Searching hotels with params:', searchParams);
      const result = await hotelService.searchHotels(searchParams);

      if (result.success && result.data) {
        setSearchResults(result.data);
        
        if (result.fallback && result.message) {
          Alert.alert('Search Results', result.message);
        } else if (result.data.length === 0) {
          Alert.alert('No Results', 'No hotels found for your search criteria. Please try different dates or location.');
        }
      } else {
        setSearchResults([]);
        Alert.alert('Error', result.error || 'No hotels found for your search criteria. Please try different dates or location.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      Alert.alert('Error', 'Unable to search hotels. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [destination, checkInDate, checkOutDate, guests]);

  const handleHotelPress = useCallback((hotel) => {
    navigation.navigate('HotelDetails', {
      hotelId: hotel.id,
      hotelName: hotel.name,
      searchParams: {
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        guests: guests,
      },
    });
  }, [navigation, checkInDate, checkOutDate, guests]);

  const handleGuestOptionPress = useCallback((num) => {
    setGuests(num);
    setShowGuestPicker(false);
  }, []);

  const renderHotelItem = useCallback(({ item: hotel }) => {
    const totalAvailableRooms = hotel.roomTypeAvailability?.reduce((sum, room) => sum + room.availableCount, 0) || 0;
    const lowestPrice = hotel.minPrice;
    const hasRooms = totalAvailableRooms > 0;

    return (
      <TouchableOpacity
        style={styles.hotelCard}
        onPress={() => handleHotelPress(hotel)}
        activeOpacity={0.7}
      >
        <View style={styles.hotelHeader}>
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={globalStyles.row}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.hotelLocationText}>
                {hotel.address ? `${hotel.address}, ` : ''}{hotel.city || hotel.destination}
              </Text>
            </View>
          </View>
          
          {hotel.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.secondary} />
              <Text style={styles.ratingText}>{hotel.rating}</Text>
            </View>
          )}
        </View>

        {hotel.description && (
          <Text style={styles.hotelDescription} numberOfLines={2}>
            {hotel.description}
          </Text>
        )}

        <View style={styles.roomInfo}>
          <View style={globalStyles.rowBetween}>
            <View style={globalStyles.row}>
              <Ionicons 
                name={hasRooms ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={hasRooms ? colors.success : colors.error} 
              />
              <Text style={[styles.availabilityText, { color: hasRooms ? colors.success : colors.error }]}>
                {hasRooms ? `${totalAvailableRooms} room${totalAvailableRooms !== 1 ? 's' : ''} available` : 'No rooms available'}
              </Text>
            </View>
            
            {hasRooms && lowestPrice && (
              <View style={globalStyles.row}>
                <Text style={styles.priceLabel}>From </Text>
                <Text style={styles.priceAmount}>ETB {lowestPrice}</Text>
                <Text style={styles.priceUnit}>/night</Text>
              </View>
            )}
          </View>

          {hasRooms && hotel.roomTypeAvailability && hotel.roomTypeAvailability.length > 0 && (
            <View style={styles.roomTypesPreview}>
              <Text style={styles.roomTypesLabel}>Available room types:</Text>
              <View style={styles.roomTypesList}>
                {hotel.roomTypeAvailability.slice(0, 3).map((room, index) => (
                  room.availableCount > 0 && (
                    <View key={index} style={styles.roomTypeChip}>
                      <Text style={styles.roomTypeText}>
                        {room.roomTypeName} (ETB {room.pricePerNight}/night)
                      </Text>
                    </View>
                  )
                ))}
                {hotel.roomTypeAvailability.length > 3 && (
                  <Text style={styles.moreRoomsText}>+{hotel.roomTypeAvailability.length - 3} more</Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.hotelFooter}>
          <View style={globalStyles.row}>
            <Text style={styles.viewButtonText}>View Details & Book</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleHotelPress]);

  return (
    <ScreenContainer 
      backgroundColor={colors.background}
      safeArea={false}
      scrollable={true}
      keyboardAvoiding={false}
      paddingHorizontal={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerTitle}>Find Your Perfect Stay</Text>
        <Text style={globalStyles.headerSubtitle}>Search from thousands of hotels</Text>
      </View>

      {/* Search Form & Results */}
      <View style={styles.searchContainer}>
        {/* Destination Input */}
        <View style={styles.inputSection}>
          <Input
            placeholder="Where are you going?"
            value={destination}
            onChangeText={handleDestinationChange}
            leftIcon={LocationIcon}
            style={styles.destinationInput}
          />
        </View>

        {/* Date Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>When</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateButton, styles.dateButtonLeft]}
              onPress={handleCheckInSelect}
              activeOpacity={0.7}
            >
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{formatDate(checkInDate)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dateButton, styles.dateButtonRight]}
              onPress={handleCheckOutSelect}
              activeOpacity={0.7}
            >
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>{formatDate(checkOutDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guest Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>Guests</Text>
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestSelect}
            activeOpacity={0.7}
          >
            <Ionicons name="people" size={20} color={colors.textSecondary} />
            <Text style={styles.guestText}>
              {guests} {guests === 1 ? 'Guest' : 'Guests'}
            </Text>
            <Ionicons 
              name={showGuestPicker ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          
          {showGuestPicker && (
            <View style={styles.guestPicker}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.guestOption,
                    guests === num && styles.guestOptionSelected,
                  ]}
                  onPress={() => handleGuestOptionPress(num)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.guestOptionText,
                      guests === num && styles.guestOptionSelectedText,
                    ]}
                  >
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <Text style={styles.searchButtonText}>Searching...</Text>
          ) : (
            <>
              <Ionicons name="search" size={20} color={colors.textOnPrimary} style={styles.searchIcon} />
              <Text style={styles.searchButtonText}>Search Hotels</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Search Results */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={globalStyles.sectionTitle}>
                {searchResults.length > 0 
                  ? `${searchResults.length} hotel${searchResults.length !== 1 ? 's' : ''} found`
                  : 'No hotels found'
                }
              </Text>
              {searchResults.length > 0 && (
                <Text style={globalStyles.sectionSubtitle}>
                  in {destination} • {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                </Text>
              )}
            </View>

            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderHotelItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={Platform.OS === 'android'}
                getItemLayout={(data, index) => ({
                  length: 300, // Approximate hotel card height
                  offset: 300 * index,
                  index,
                })}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
                contentContainerStyle={styles.resultsListContainer}
              />
            ) : hasSearched && !loading && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.noResultsText}>No hotels found</Text>
                <Text style={styles.noResultsSubtext}>Try adjusting your search criteria</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={showCheckInPicker}
        onClose={() => setShowCheckInPicker(false)}
        onDateSelect={(date) => handleDateChange(date, 'checkIn')}
        selectedDate={checkInDate}
        minimumDate={new Date()}
        title="Check-in Date"
      />
      
      <DatePickerModal
        visible={showCheckOutPicker}
        onClose={() => setShowCheckOutPicker(false)}
        onDateSelect={(date) => handleDateChange(date, 'checkOut')}
        selectedDate={checkOutDate}
        minimumDate={new Date(checkInDate.getTime() + 86400000)}
        title="Check-out Date"
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  
  inputSection: {
    marginBottom: spacing.lg,
  },
  
  destinationInput: {
    marginVertical: 0,
  },
  
  sectionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  dateButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.medium,
  },
  
  dateButtonLeft: {
    marginRight: spacing.xs,
  },
  
  dateButtonRight: {
    marginLeft: spacing.xs,
  },
  
  dateLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  
  dateValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.medium,
  },
  
  guestText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  
  guestPicker: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    ...shadows.medium,
  },
  
  guestOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  guestOptionSelected: {
    backgroundColor: colors.primary,
  },
  
  guestOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  
  guestOptionSelectedText: {
    color: colors.textOnPrimary,
    fontWeight: typography.fontWeight.semiBold,
  },
  
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  
  searchButtonDisabled: {
    backgroundColor: colors.lightGray,
    ...shadows.small,
  },
  
  searchIcon: {
    marginRight: spacing.sm,
  },
  
  searchButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textOnPrimary,
  },
  
  // Results section styles
  resultsSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  
  resultsHeader: {
    marginBottom: spacing.md,
  },
  
  resultsListContainer: {
    paddingBottom: spacing.md,
  },
  
  // Hotel card styles
  hotelCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.large,
  },
  
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  
  hotelInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  
  hotelName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  hotelLocationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  
  hotelDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  
  hotelFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  
  // Room information styles
  roomInfo: {
    marginBottom: spacing.md,
  },
  
  availabilityText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  
  priceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  priceAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  
  priceUnit: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  
  roomTypesPreview: {
    marginTop: spacing.sm,
  },
  
  roomTypesLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  
  roomTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  
  roomTypeChip: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  
  roomTypeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  
  moreRoomsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  viewButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
    marginRight: spacing.xs,
  },
  
  // No results styles
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  
  noResultsText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  noResultsSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default SearchScreen;