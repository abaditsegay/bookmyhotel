import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  LocalOffer as OfferIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

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

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  maxAds = 4
}) => {
  // Sample advertisement data
  const advertisements: Advertisement[] = [
    {
      id: '1',
      title: 'Luxury Spa Resort - Weekend Getaway',
      description: 'Experience ultimate relaxation with our premium spa packages and oceanview suites.',
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
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
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
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
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop',
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
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop',
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
      imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=300&h=200&fit=crop',
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

  const formatValidUntil = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const displayedAds = advertisements.slice(0, maxAds);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <OfferIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
          Special Offers
        </Typography>
        <Chip 
          label="Sponsored" 
          size="small" 
          color="primary" 
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
                  href={ad.ctaUrl}
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
        <Typography variant="caption" color="text.secondary">
          Sponsored content • Advertise with us
        </Typography>
      </Box>
    </Box>
  );
};

export default AdvertisementBanner;
