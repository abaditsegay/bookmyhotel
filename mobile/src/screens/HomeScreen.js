import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Import services and components
import { hotelService } from '../services/hotelService';
import { Card, Button, LoadingSpinner, ScreenContainer } from '../components/common';
import { colors, typography, spacing, globalStyles } from '../styles/globalStyles';

const HomeScreen = ({ navigation }) => {
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load featured hotels from API
      const hotelsResponse = await hotelService.searchHotels({
        limit: 3 // Get top 3 featured hotels
      });
      
      if (hotelsResponse.success && hotelsResponse.data) {
        setFeaturedHotels(hotelsResponse.data.hotels || hotelsResponse.data);
      }
      
      // Load destinations from API
      const destinationsResponse = await hotelService.getDestinations();
      if (destinationsResponse.success) {
        setDestinations(destinationsResponse.data.slice(0, 6));
      }
      
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert(
        'Connection Error',
        'Unable to load hotels. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      setFeaturedHotels([]);
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  // Load data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadHomeData();
    }, [])
  );

  // Navigate to hotel details
  const handleHotelPress = (hotel) => {
    // Create default search parameters for booking functionality
    const defaultSearchParams = {
      destination: hotel.city || 'Addis Ababa',
      checkInDate: new Date().toISOString().split('T')[0], // Today
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      guests: 2,
      rooms: 1,
    };

    navigation.navigate('HotelDetails', {
      hotelId: hotel.id,
      hotelName: hotel.name,
      searchParams: defaultSearchParams,
    });
  };

  // Navigate to search with destination
  const handleDestinationPress = (destination) => {
    navigation.navigate('Search', {
      destination: destination,
    });
  };

  // Navigate to search screen
  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <LoadingSpinner text="Loading hotels..." />
      </View>
    );
  }

  return (
    <ScreenContainer
      refreshing={refreshing}
      onRefresh={onRefresh}
      paddingHorizontal={false}
      // Enhanced Android-specific scroll optimizations
      keyboardAvoiding={Platform.OS === 'android'}
      scrollEventThrottle={Platform.OS === 'android' ? 1 : 16}
      keyboardDismissMode={Platform.OS === 'android' ? 'interactive' : 'none'}
      showsVerticalScrollIndicator={Platform.OS === 'ios'}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome to BookMyHotel</Text>
        <Text style={styles.welcomeSubtitle}>
          Find and book your perfect stay
        </Text>
      </View>

      <View style={styles.contentPadding}>
        {/* Quick Search Button */}
        <Card style={styles.searchCard}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchPress}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={24} color={colors.primary} />
            <Text style={styles.searchButtonText}>Search Hotels</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Popular Destinations */}
        {destinations.length > 0 && (
          <View style={globalStyles.section}>
            <Text style={globalStyles.sectionTitle}>Popular Destinations</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.destinationsScroll}
              nestedScrollEnabled={true}
              // Enhanced Android horizontal scroll optimization
              decelerationRate={Platform.OS === 'android' ? 'fast' : 'normal'}
              scrollEventThrottle={Platform.OS === 'android' ? 1 : 16}
              overScrollMode={Platform.OS === 'android' ? 'never' : 'always'}
              keyboardShouldPersistTaps="handled"
            >
              {destinations.map((destination, index) => (
                <TouchableOpacity
                  key={destination.id || index}
                  style={styles.destinationCard}
                  onPress={() => handleDestinationPress(destination.name)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location" size={20} color={colors.primary} />
                  <Text style={styles.destinationText}>{destination.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Hotels */}
        {featuredHotels.length > 0 && (
          <View style={globalStyles.section}>
            <View style={globalStyles.sectionHeader}>
              <Text style={globalStyles.sectionTitle}>Featured Hotels</Text>
              <TouchableOpacity onPress={handleSearchPress}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {featuredHotels.map((hotel) => (
              <Card
                key={hotel.id}
                style={styles.hotelCard}
                onPress={() => handleHotelPress(hotel)}
              >
                <View style={styles.hotelHeader}>
                  <View style={styles.hotelInfo}>
                    <Text style={styles.hotelName}>{hotel.name}</Text>
                    <View style={styles.hotelLocation}>
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.hotelLocationText}>
                        {hotel.address}, {hotel.city}
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

                <View style={styles.hotelFooter}>
                  <View style={styles.amenitiesContainer}>
                    {hotel.amenities && hotel.amenities.slice(0, 3).map((amenity, index) => (
                      <View key={index} style={styles.amenityTag}>
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleHotelPress(hotel)}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleSearchPress}
            >
              <Ionicons name="search" size={32} color={colors.primary} />
              <Text style={styles.quickActionText}>Search Hotels</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Bookings')}
            >
              <Ionicons name="calendar" size={32} color={colors.primary} />
              <Text style={styles.quickActionText}>My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Empty State */}
        {featuredHotels.length === 0 && destinations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>Welcome to BookMyHotel</Text>
            <Text style={styles.emptyStateText}>
              Start by searching for hotels in your desired destination
            </Text>
            <Button
              title="Search Hotels"
              onPress={handleSearchPress}
              style={styles.emptyStateButton}
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  welcomeSection: {
    ...globalStyles.header,
  },
  
  welcomeTitle: {
    ...globalStyles.headerTitle,
  },
  
  welcomeSubtitle: {
    ...globalStyles.headerSubtitle,
  },
  
  contentPadding: {
    paddingHorizontal: spacing.md,
  },
  
  searchCard: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: 0,
  },
  
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  
  searchButtonText: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  
  seeAllText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  
  destinationsScroll: {
    marginBottom: spacing.sm,
  },
  
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  destinationText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  
  hotelCard: {
    marginBottom: spacing.md,
  },
  
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  
  hotelInfo: {
    flex: 1,
  },
  
  hotelName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  
  hotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: spacing.md,
  },
  
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  amenitiesContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  
  amenityTag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    marginRight: spacing.xs,
  },
  
  amenityText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  viewButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.xs,
  },
  
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  quickActionCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  quickActionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  emptyStateText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.lg,
  },
  
  emptyStateButton: {
    minWidth: 200,
  },
});

export default HomeScreen;
