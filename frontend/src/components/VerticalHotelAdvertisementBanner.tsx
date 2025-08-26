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

interface VerticalHotelAdvertisementBannerProps {
  maxHotels?: number;
}

// Fallback hotel data
const fallbackHotels: HotelSearchResult[] = [
  {
    id: 1,
    name: 'Luxury Spa Resort',
    description: 'Experience ultimate relaxation with our premium spa packages.',
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
    description: 'Modern amenities perfect for business travelers.',
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
    description: 'Escape to nature with breathtaking mountain views.',
    address: '789 Mountain Trail',
    city: 'Aspen',
    country: 'USA',
    minPrice: 259,
    maxPrice: 359,
    availableRooms: [],
    roomTypeAvailability: []
  }
];

export default function VerticalHotelAdvertisementBanner({ maxHotels = 3 }: VerticalHotelAdvertisementBannerProps) {
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
    // Navigate to hotel details
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
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ mb: 1.5, px: 2, pt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfferIcon color="primary" />
          Special Deals
        </Typography>
        <Stack spacing={1} sx={{ px: 2, pb: 2 }}>
          {[...Array(3)].map((_, index) => (
            <Card key={index} sx={{ width: '100%' }}>
              <Skeleton variant="rectangular" width="100%" height={80} />
              <CardContent sx={{ p: 1 }}>
                <Skeleton variant="text" width="80%" height={16} />
                <Skeleton variant="text" width="60%" height={14} />
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 1.5, px: 2, pt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <OfferIcon color="primary" />
        Special Deals
        {error && (
          <Alert severity="info" sx={{ ml: 1, py: 0, fontSize: '0.75rem' }}>
            Sample
          </Alert>
        )}
      </Typography>
      
      <Stack 
        spacing={1} 
        sx={{ 
          flex: 1,
          px: 2,
          pb: 2,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: 2,
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
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              },
            }}
            onClick={() => handleHotelClick(hotel)}
          >
            <CardMedia
              component="img"
              height="80"
              image={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=80&fit=crop&crop=center&auto=format`}
              alt={hotel.name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.85rem' }}>
                {hotel.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {hotel.city}, {hotel.country}
                </Typography>
              </Box>
              
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 0.5,
                  fontSize: '0.7rem',
                }}
              >
                {hotel.description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    ${hotel.minPrice}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    per night
                  </Typography>
                </Box>
                {hotel.maxPrice && hotel.maxPrice > hotel.minPrice && (
                  <Chip 
                    label="Multiple" 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    sx={{ fontSize: '0.65rem', height: '18px' }}
                  />
                )}
              </Box>
              
              <Button 
                variant="contained" 
                size="small"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  handleHotelClick(hotel);
                }}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  py: 0.5
                }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, pb: 1 }}>
        <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          Refreshes every 2 minutes
        </Typography>
      </Box>
    </Box>
  );
}
