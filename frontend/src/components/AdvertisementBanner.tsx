import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Skeleton,
  Alert
} from '@mui/material';
import {
  LocalOffer as OfferIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { hotelApiService } from '../services/hotelApi';
import { HotelSearchResult } from '../types/hotel';
import { useAuth } from '../contexts/AuthContext';

interface AdvertisementBannerProps {
  maxAds?: number;
}

// Fallback hotel data
const fallbackHotels: HotelSearchResult[] = [
  {
    id: 1,
    name: 'Luxury Spa Resort',
    description: 'Experience ultimate relaxation with our premium spa packages and oceanview suites.',
    address: '123 Ocean Drive',
    city: 'Malibu',
    country: 'USA',
    minPrice: 299,
    maxPrice: 399,
    availableRooms: [],
    roomTypeAvailability: []
  },
  {
    id: 2,
    name: 'Business Hotel Downtown',
    description: 'Modern amenities perfect for business travelers in the heart of the city.',
    address: '456 Business Blvd',
    city: 'New York',
    country: 'USA',
    minPrice: 199,
    maxPrice: 299,
    availableRooms: [],
    roomTypeAvailability: []
  },
  {
    id: 3,
    name: 'Mountain View Lodge',
    description: 'Escape to nature with breathtaking mountain views and outdoor activities.',
    address: '789 Mountain Trail',
    city: 'Aspen',
    country: 'USA',
    minPrice: 259,
    maxPrice: 359,
    availableRooms: [],
    roomTypeAvailability: []
  }
];

export default function AdvertisementBanner({ maxAds = 5 }: AdvertisementBannerProps) {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch random hotels from API
  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const randomHotels = await hotelApiService.getRandomHotels();
      
      if (randomHotels && randomHotels.length > 0) {
        setHotels(randomHotels.slice(0, maxAds));
      } else {
        // Use fallback hotels if no API hotels available
        setHotels(fallbackHotels.slice(0, maxAds));
      }
    } catch (err) {
      console.warn('Failed to fetch random hotels from API, using fallback:', err);
      setError('Using sample hotels');
      setHotels(fallbackHotels.slice(0, maxAds));
    } finally {
      setLoading(false);
    }
  }, [maxAds]);

  // Handle hotel click
  const handleHotelClick = (hotel: HotelSearchResult) => {
    // Navigate to hotel details (you can customize this URL)
    window.location.href = `/hotels/${hotel.id}`;
  };

  // Load hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // Set up 2-minute rotation
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHotels();
    }, 120000); // 120 seconds = 2 minutes

    return () => clearInterval(interval);
  }, [fetchHotels]);

  // Hide advertisement banner for operations users
  const isOperationsUser = user?.role === 'OPERATIONS_SUPERVISOR' || 
                           user?.role === 'HOUSEKEEPING' || 
                           user?.role === 'MAINTENANCE';

  if (isOperationsUser) {
    return null; // Don't render anything for operations users
  }

  // Show loading skeletons
  if (loading && hotels.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfferIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
            Featured Hotels
          </Typography>
          <Chip 
            label="Loading" 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
        <Stack spacing={2}>
          {Array.from({ length: maxAds }).map((_, index) => (
            <Card key={index}>
              <Skeleton variant="rectangular" height={120} />
              <CardContent>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  }

  const displayedHotels = hotels.slice(0, maxAds);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <OfferIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
          Featured Hotels
        </Typography>
        <Chip 
          label={error ? "Sample Hotels" : "Live Data"} 
          size="small" 
          color={error ? "warning" : "primary"} 
          variant="outlined"
        />
      </Box>

      {/* Hotel Cards */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Stack spacing={2}>
          {displayedHotels.map((hotel, index) => (
            <Card 
              key={hotel.id}
              sx={{ 
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                }
              }}
              onClick={() => handleHotelClick(hotel)}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop"
                  alt={hotel.name}
                  sx={{ objectFit: 'cover' }}
                />
                <Chip
                  label="Featured"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
              
              <CardContent sx={{ p: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 1,
                    fontSize: '0.95rem',
                    lineHeight: 1.2
                  }}
                >
                  {hotel.name}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.3
                  }}
                >
                  {hotel.description}
                </Typography>

                {/* Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {hotel.city}, {hotel.country}
                  </Typography>
                </Box>

                {/* Price Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${hotel.minPrice}
                  </Typography>
                  {hotel.maxPrice > hotel.minPrice && (
                    <Typography variant="body2" color="text.secondary">
                      - ${hotel.maxPrice}
                    </Typography>
                  )}
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                    /night
                  </Typography>
                </Box>

                {/* CTA Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: 2
                  }}
                >
                  View Details
                </Button>
              </CardContent>
              
              {index < displayedHotels.length - 1 && <Divider />}
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        {error ? (
          <Alert severity="info" sx={{ mb: 1 }}>
            Showing sample hotels. Live hotel data will be available once connected to the API.
          </Alert>
        ) : null}
        <Typography variant="caption" color="text.secondary">
          Updates every 2 minutes • {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
}
