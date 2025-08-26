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
  LocationOn as LocationIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { hotelApiService } from '../services/hotelApi';
import { HotelSearchResult } from '../types/hotel';
import { useAuth } from '../contexts/AuthContext';

interface HotelAdvertisementBannerProps {
  maxHotels?: number;
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

export default function HotelAdvertisementBanner({ maxHotels = 5 }: HotelAdvertisementBannerProps) {
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
        setHotels(randomHotels.slice(0, maxHotels));
      } else {
        // Use fallback hotels if no API hotels available
        setHotels(fallbackHotels.slice(0, maxHotels));
      }
    } catch (err) {
      console.warn('Failed to fetch random hotels from API, using fallback:', err);
      setError('Using sample hotels');
      setHotels(fallbackHotels.slice(0, maxHotels));
    } finally {
      setLoading(false);
    }
  }, [maxHotels]);

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

  // Hide hotel banner for operations users
  const isOperationsUser = user?.role === 'OPERATIONS_SUPERVISOR' || 
                           user?.role === 'HOUSEKEEPING' || 
                           user?.role === 'MAINTENANCE';

  if (isOperationsUser) {
    return null;
  }

  if (loading && hotels.length === 0) {
    return (
      <Box sx={{ py: 2, px: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfferIcon color="primary" />
          Featured Hotels
        </Typography>
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto' }}>
          {[...Array(3)].map((_, index) => (
            <Card key={index} sx={{ minWidth: 300, flex: '0 0 auto' }}>
              <Skeleton variant="rectangular" width={300} height={150} />
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

  if (!hotels || hotels.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 2, px: 3, backgroundColor: '#f8f9fa' }}>
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <OfferIcon color="primary" />
        Featured Hotels
        {error && (
          <Alert severity="info" sx={{ ml: 2, py: 0 }}>
            {error}
          </Alert>
        )}
      </Typography>
      
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: '#a8a8a8',
            },
          },
        }}
      >
        {hotels.map((hotel) => (
          <Card 
            key={hotel.id} 
            sx={{ 
              minWidth: 320,
              maxWidth: 320,
              flex: '0 0 auto',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              },
            }}
            onClick={() => handleHotelClick(hotel)}
          >
            <CardMedia
              component="img"
              height="150"
              image={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=150&fit=crop&crop=center&auto=format`}
              alt={hotel.name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}>
                {hotel.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {hotel.city}, {hotel.country}
                </Typography>
              </Box>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {hotel.description}
              </Typography>
              
              <Divider sx={{ my: 0.5 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    ${hotel.minPrice}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    per night
                  </Typography>
                </Box>
                {hotel.maxPrice > hotel.minPrice && (
                  <Chip 
                    label="Multiple Options" 
                    size="small" 
                    variant="outlined" 
                    color="primary" 
                  />
                )}
              </Box>
              
              <Button 
                variant="contained" 
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  handleHotelClick(hotel);
                }}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
        <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
        <Typography variant="caption" color="text.secondary">
          Hotels refresh every 2 minutes
        </Typography>
      </Box>
    </Box>
  );
}
