import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import HotelDetailsScreen from '../screens/HotelDetailsScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import BookingLookupScreen from '../screens/BookingLookupScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';

// Temporary placeholder screens for remaining screens
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../styles/globalStyles';

// Placeholder component for screens
const PlaceholderScreen = ({ title, description }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>{title}</Text>
    <Text style={styles.placeholderDescription}>{description}</Text>
  </View>
);

// Placeholder screens for incomplete features - NONE NEEDED - ALL COMPLETE!

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main screens
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: typography.fontWeight.semiBold,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'BookMyHotel',
          headerTitle: 'BookMyHotel',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: 'Search Hotels',
          headerTitle: 'Search Hotels',
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingLookupScreen}
        options={{
          title: 'My Bookings',
          headerTitle: 'My Bookings',
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.textOnPrimary,
          headerTitleStyle: {
            fontWeight: typography.fontWeight.semiBold,
          },
          cardStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {/* Main Tab Navigator */}
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        
        {/* Modal screens for booking flow */}
        <Stack.Screen 
          name="HotelDetails" 
          component={HotelDetailsScreen}
          options={({ route }) => ({
            title: route.params?.hotelName || 'Hotel Details',
            presentation: 'card',
          })}
        />
        
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen}
          options={{
            title: 'Complete Booking',
            presentation: 'card',
          }}
        />
        
        <Stack.Screen 
          name="BookingConfirmation" 
          component={BookingConfirmationScreen}
          options={{
            title: 'Booking Confirmed',
            presentation: 'card',
            headerLeft: () => null, // Prevent going back
            gestureEnabled: false, // Disable swipe to go back
          }}
        />
        
        <Stack.Screen 
          name="BookingDetails" 
          component={BookingDetailsScreen}
          options={{
            title: 'Booking Details',
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles for placeholder screens
const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  placeholderTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  placeholderDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
});

export default AppNavigator;
