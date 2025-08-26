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
  Star as StarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import adApiService, { AdResponse } from '../services/adApi';
import { useAuth } from '../contexts/AuthContext';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: string;
  originalPrice?: string;
  discount?: string;
  location?: string;
  rating?: number;
  validUntil?: string;
  ctaText: string;
  ctaUrl: string;
  isSponsored?: boolean;
}

interface AdvertisementBannerProps {
  maxAds?: number;
}

// Fallback advertisement data with professional hotel images
const fallbackAdvertisements: Advertisement[] = [
  {
    id: '1',
    title: 'Luxury Spa Resort - Weekend Getaway',
    description: 'Experience ultimate relaxation with our premium spa packages and oceanview suites.',
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&h=200&fit=crop&crop=center',
    price: '$299',
    originalPrice: '$399',
    discount: '25% OFF',
    location: 'Malibu, CA',
    rating: 4.8,
    validUntil: '2025-09-15',
    ctaText: 'Book Now',
    ctaUrl: '#',
    isSponsored: true
  },
  {
    id: '2',
    title: 'Business Hotel Downtown',
    description: 'Perfect for business travelers with modern amenities and conference facilities.',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop&crop=center',
    price: '$189',
    originalPrice: '$249',
    discount: '24% OFF',
    location: 'San Francisco, CA',
    rating: 4.6,
    validUntil: '2025-08-30',
    ctaText: 'View Deals',
    ctaUrl: '#',
    isSponsored: true
  },
  {
    id: '3',
    title: 'Mountain Resort & Adventure',
    description: 'Outdoor activities, hiking trails, and cozy mountain lodge atmosphere.',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop&crop=center',
    price: '$149',
    originalPrice: '$199',
    discount: '25% OFF',
    location: 'Aspen, CO',
    rating: 4.7,
    validUntil: '2025-09-30',
    ctaText: 'Explore',
    ctaUrl: '#',
    isSponsored: false
  },
  {
    id: '4',
    title: 'Boutique City Hotel',
    description: 'Unique design, local cuisine, and personalized service in the heart of the city.',
    imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop&crop=center',
    price: '$219',
    originalPrice: '$279',
    discount: '22% OFF',
    location: 'New York, NY',
    rating: 4.9,
    validUntil: '2025-08-25',
    ctaText: 'Book Now',
    ctaUrl: '#',
    isSponsored: true
  },
  {
    id: '5',
    title: 'Beach Resort Paradise',
    description: 'Tropical paradise with pristine beaches, water sports, and sunset dinners.',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop&crop=center',
    price: '$349',
    originalPrice: '$449',
    discount: '22% OFF',
    location: 'Miami, FL',
    rating: 4.8,
    validUntil: '2025-09-10',
    ctaText: 'Book Now',
    ctaUrl: '#',
    isSponsored: true
  }
];

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  maxAds = 4
}) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Convert API response to Advertisement format
  const convertAdResponseToAdvertisement = (adResponse: AdResponse): Advertisement => {
    const discount = adResponse.discountPercentage > 0 
      ? `${Math.round(adResponse.discountPercentage)}% OFF` 
      : undefined;
    
    return {
      id: adResponse.id.toString(),
      title: adResponse.title,
      description: adResponse.description || `Special offers at ${adResponse.hotelName}`,
      imageUrl: adResponse.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
      price: `$${adResponse.discountedPrice}`,
      originalPrice: adResponse.originalPrice !== adResponse.discountedPrice ? `$${adResponse.originalPrice}` : undefined,
      discount,
      location: adResponse.hotelLocation,
      rating: undefined, // Rating could be added to Ad entity in future
      validUntil: adResponse.validUntil,
      ctaText: 'Book Now',
      ctaUrl: `/search-results?hotelId=${adResponse.hotelId}`,
      isSponsored: true
    };
  };

  // Fetch ads from API
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiAds = await adApiService.getRandomActiveAds(maxAds);
      
      if (apiAds && apiAds.length > 0) {
        const convertedAds = apiAds.map(convertAdResponseToAdvertisement);
        setAds(convertedAds);
      } else {
        // Use fallback ads if no API ads available
        setAds(fallbackAdvertisements.slice(0, maxAds));
      }
    } catch (err) {
      console.warn('Failed to fetch ads from API, using fallback:', err);
      setError('Using sample ads');
      setAds(fallbackAdvertisements.slice(0, maxAds));
    } finally {
      setLoading(false);
    }
  }, [maxAds]);

  // Track ad click
  const handleAdClick = async (ad: Advertisement) => {
    try {
      // Only track clicks for ads from the API (numeric IDs)
      const adId = parseInt(ad.id);
      if (!isNaN(adId)) {
        await adApiService.trackAdClick(adId);
      }
    } catch (err) {
      console.warn('Failed to track ad click:', err);
    }
    // Navigate to the URL regardless of tracking success
    if (ad.ctaUrl !== '#') {
      window.location.href = ad.ctaUrl;
    }
  };

  // Load ads on component mount
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Set up 1-minute rotation
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAds();
    }, 60000); // 60 seconds = 1 minute

    return () => clearInterval(interval);
  }, [fetchAds]);

  // Hide advertisement banner for operations users
  const isOperationsUser = user?.role === 'OPERATIONS_SUPERVISOR' || 
                           user?.role === 'HOUSEKEEPING' || 
                           user?.role === 'MAINTENANCE';

  if (isOperationsUser) {
    return null; // Don't render anything for operations users
  }

  const formatValidUntil = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Show loading skeletons
  if (loading && ads.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfferIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
            Special Offers
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

  const displayedAds = ads.slice(0, maxAds);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <OfferIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
          Special Offers
        </Typography>
        <Chip 
          label={error ? "Sample Ads" : "Sponsored"} 
          size="small" 
          color={error ? "warning" : "primary"} 
          variant="outlined"
        />
      </Box>

      {/* Advertisement Cards */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Stack spacing={2}>
          {displayedAds.map((ad, index) => (
            <Card 
              key={ad.id}
              sx={{ 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={ad.imageUrl}
                  alt={ad.title}
                  sx={{ objectFit: 'cover' }}
                />
                {ad.discount && (
                  <Chip
                    label={ad.discount}
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontWeight: 'bold'
                    }}
                  />
                )}
                {ad.isSponsored && (
                  <Chip
                    label="Sponsored"
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
                )}
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
                  {ad.title}
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
                  {ad.description}
                </Typography>

                {/* Location and Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {ad.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {ad.location}
                      </Typography>
                    </Box>
                  )}
                  {ad.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                      <StarIcon sx={{ fontSize: 14, color: '#ffc107' }} />
                      <Typography variant="caption" color="text.secondary">
                        {ad.rating}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Price Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {ad.price}
                  </Typography>
                  {ad.originalPrice && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textDecoration: 'line-through',
                        color: 'text.secondary'
                      }}
                    >
                      {ad.originalPrice}
                    </Typography>
                  )}
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                    /night
                  </Typography>
                </Box>

                {/* Valid Until */}
                {ad.validUntil && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                    <TimeIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                    <Typography variant="caption" color="warning.main">
                      Valid until {formatValidUntil(ad.validUntil)}
                    </Typography>
                  </Box>
                )}

                {/* CTA Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="small"
                  onClick={() => handleAdClick(ad)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: 2
                  }}
                >
                  {ad.ctaText}
                </Button>
              </CardContent>
              
              {index < displayedAds.length - 1 && <Divider />}
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        {error ? (
          <Alert severity="info" sx={{ mb: 1 }}>
            Showing sample ads. Live ads from registered hotels will be available soon.
          </Alert>
        ) : null}
        <Typography variant="caption" color="text.secondary">
          Sponsored content • Advertise with us
        </Typography>
      </Box>
    </Box>
  );
};

export default AdvertisementBanner;
