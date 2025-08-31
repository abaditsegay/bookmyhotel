import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { hotelService } from '../services/hotelService';

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

  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${month} ${day}`;
  };

  const handleDateChange = (event, selectedDate, type) => {
    if (Platform.OS === 'android') {
      setShowCheckInPicker(false);
      setShowCheckOutPicker(false);
    }
    
    if (selectedDate) {
      if (type === 'checkIn') {
        setCheckInDate(selectedDate);
        setShowCheckInPicker(false);
        // Ensure check-out is after check-in
        if (selectedDate >= checkOutDate) {
          setCheckOutDate(new Date(selectedDate.getTime() + 86400000));
        }
      } else {
        setCheckOutDate(selectedDate);
        setShowCheckOutPicker(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!destination.trim()) {
      Alert.alert('Required', 'Please enter a destination');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const searchParams = {
        destination: destination.trim(),
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        guests: guests,
      };

      console.log('🔍 Searching hotels with params:', searchParams);
      const result = await hotelService.searchHotels(searchParams);

      if (result.success && result.data) {
        setSearchResults(result.data);
        if (result.data.length === 0) {
          Alert.alert('No Results', 'No hotels found for your search criteria. Please try different dates or location.');
        }
      } else {
        setSearchResults([]);
        Alert.alert('No Results', 'No hotels found for your search criteria. Please try different dates or location.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      Alert.alert('Error', 'Unable to search hotels. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHotelPress = (hotel) => {
    navigation.navigate('HotelDetails', {
      hotelId: hotel.id,
      hotelName: hotel.name,
      searchParams: {
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        guests: guests,
      },
    });
  };

  const renderHotelItem = ({ item: hotel }) => {
    // Calculate total available rooms
    const totalAvailableRooms = hotel.roomTypeAvailability?.reduce((sum, room) => sum + room.availableCount, 0) || 0;
    const lowestPrice = hotel.minPrice;
    const hasRooms = totalAvailableRooms > 0;

    return (
      <TouchableOpacity
        style={styles.hotelCard}
        onPress={() => handleHotelPress(hotel)}
      >
        <View style={styles.hotelHeader}>
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={styles.hotelLocation}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.hotelLocationText}>
                {hotel.address ? `${hotel.address}, ` : ''}{hotel.city || hotel.destination}
              </Text>
            </View>
          </View>
          
          {hotel.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{hotel.rating}</Text>
            </View>
          )}
        </View>

        {hotel.description && (
          <Text style={styles.hotelDescription} numberOfLines={2}>
            {hotel.description}
          </Text>
        )}

        {/* Room Availability and Pricing */}
        <View style={styles.roomInfo}>
          <View style={styles.availabilitySection}>
            <View style={styles.roomCount}>
              <Ionicons 
                name={hasRooms ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={hasRooms ? "#28a745" : "#dc3545"} 
              />
              <Text style={[styles.availabilityText, { color: hasRooms ? "#28a745" : "#dc3545" }]}>
                {hasRooms ? `${totalAvailableRooms} room${totalAvailableRooms !== 1 ? 's' : ''} available` : 'No rooms available'}
              </Text>
            </View>
            
            {hasRooms && lowestPrice && (
              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>From</Text>
                <Text style={styles.priceAmount}>${lowestPrice}</Text>
                <Text style={styles.priceUnit}>/night</Text>
              </View>
            )}
          </View>

          {/* Room Types Preview */}
          {hasRooms && hotel.roomTypeAvailability && hotel.roomTypeAvailability.length > 0 && (
            <View style={styles.roomTypesPreview}>
              <Text style={styles.roomTypesLabel}>Available room types:</Text>
              <View style={styles.roomTypesList}>
                {hotel.roomTypeAvailability.slice(0, 3).map((room, index) => (
                  room.availableCount > 0 && (
                    <View key={index} style={styles.roomTypeChip}>
                      <Text style={styles.roomTypeText}>
                        {room.roomTypeName} (${room.pricePerNight}/night)
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
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details & Book</Text>
            <Ionicons name="arrow-forward" size={16} color="#2E7BE6" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7BE6" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Perfect Stay</Text>
        <Text style={styles.headerSubtitle}>Search from thousands of hotels</Text>
      </View>

      {/* Search Form & Results */}
      <ScrollView style={styles.searchContainer} showsVerticalScrollIndicator={false}>
        {/* Destination Input */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Where are you going?"
              value={destination}
              onChangeText={setDestination}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>When</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateButton, { marginRight: 8 }]}
              onPress={() => setShowCheckInPicker(true)}
            >
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{formatDate(checkInDate)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.dateButton, { marginLeft: 8 }]}
              onPress={() => setShowCheckOutPicker(true)}
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
            onPress={() => setShowGuestPicker(!showGuestPicker)}
          >
            <Ionicons name="people" size={20} color="#666" />
            <Text style={styles.guestText}>
              {guests} {guests === 1 ? 'Guest' : 'Guests'}
            </Text>
            <Ionicons 
              name={showGuestPicker ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
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
                  onPress={() => {
                    setGuests(num);
                    setShowGuestPicker(false);
                  }}
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
        >
          {loading ? (
            <Text style={styles.searchButtonText}>Searching...</Text>
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
              <Text style={styles.searchButtonText}>Search Hotels</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Search Results */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {searchResults.length > 0 
                  ? `${searchResults.length} hotel${searchResults.length !== 1 ? 's' : ''} found`
                  : 'No hotels found'
                }
              </Text>
              {searchResults.length > 0 && (
                <Text style={styles.resultsSubtitle}>
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
                showsVerticalScrollIndicator={false}
              />
            ) : hasSearched && !loading && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color="#999" />
                <Text style={styles.noResultsText}>No hotels found</Text>
                <Text style={styles.noResultsSubtext}>Try adjusting your search criteria</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Date Pickers */}
      {showCheckInPicker && (
        <DateTimePicker
          value={checkInDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, date) => handleDateChange(event, date, 'checkIn')}
        />
      )}

      {showCheckOutPicker && (
        <DateTimePicker
          value={checkOutDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date(checkInDate.getTime() + 86400000)}
          onChange={(event, date) => handleDateChange(event, date, 'checkOut')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2E7BE6',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F2FF',
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  guestText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  guestPicker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  guestOption: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guestOptionSelected: {
    backgroundColor: '#2E7BE6',
  },
  guestOptionText: {
    fontSize: 16,
    color: '#333',
  },
  guestOptionSelectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#2E7BE6',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#2E7BE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  // Results section styles
  resultsSection: {
    marginTop: 8,
    marginBottom: 40,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // Hotel card styles
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hotelInfo: {
    flex: 1,
    marginRight: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  hotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelLocationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  hotelDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  hotelFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  // Room information styles
  roomInfo: {
    marginBottom: 16,
  },
  availabilitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7BE6',
  },
  priceUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  roomTypesPreview: {
    marginTop: 8,
  },
  roomTypesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  roomTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  roomTypeChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  roomTypeText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  moreRoomsText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  availableText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#2E7BE6',
    fontWeight: '600',
    marginRight: 4,
  },
  // No results styles
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default SearchScreen;