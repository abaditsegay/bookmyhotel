import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

/**
 * Skeleton loader for booking cards
 */
export const BookingCardSkeleton: React.FC = () => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
);

/**
 * Skeleton loader for product/room cards
 */
export const ProductCardSkeleton: React.FC = () => (
  <Card>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" width="80%" height={28} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="rectangular" width="48%" height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="48%" height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
);

/**
 * Skeleton loader for table rows
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <Box sx={{ display: 'flex', gap: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
    {Array.from({ length: columns }).map((_, index) => (
      <Skeleton key={index} variant="text" width={`${100 / columns}%`} />
    ))}
  </Box>
);

/**
 * Skeleton loader for list items
 */
export const ListItemSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Skeleton variant="circular" width={48} height={48} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="70%" height={24} />
      <Skeleton variant="text" width="40%" />
    </Box>
    <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
  </Box>
);

/**
 * Skeleton loader for dashboard stats
 */
export const StatCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="50%" height={40} />
        </Box>
        <Skeleton variant="circular" width={48} height={48} />
      </Box>
      <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
    </CardContent>
  </Card>
);

/**
 * Skeleton loader for hotel search results
 */
export const HotelCardSkeleton: React.FC = () => (
  <Card sx={{ mb: 2 }}>
    <Box sx={{ display: { xs: 'block', sm: 'flex' } }}>
      <Skeleton 
        variant="rectangular" 
        sx={{ 
          width: { xs: '100%', sm: 280 }, 
          height: { xs: 200, sm: 240 } 
        }} 
      />
      <CardContent sx={{ flex: 1 }}>
        <Skeleton variant="text" width="70%" height={32} />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Skeleton variant="text" width="30%" height={36} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>
    </Box>
  </Card>
);

/**
 * Skeleton loader for form inputs
 */
export const FormFieldSkeleton: React.FC = () => (
  <Box sx={{ mb: 2 }}>
    <Skeleton variant="text" width="30%" height={20} sx={{ mb: 0.5 }} />
    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
  </Box>
);

/**
 * Generic page skeleton with header and content
 */
export const PageSkeleton: React.FC<{ hasStats?: boolean }> = ({ hasStats = false }) => (
  <Box>
    {/* Header */}
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width="40%" height={48} />
      <Skeleton variant="text" width="60%" />
    </Box>

    {/* Stats cards (optional) */}
    {hasStats && (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>
    )}

    {/* Content cards */}
    <Grid container spacing={2}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} key={i}>
          <BookingCardSkeleton />
        </Grid>
      ))}
    </Grid>
  </Box>
);

/**
 * Skeleton for booking details page
 */
export const BookingDetailsSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width="50%" height={48} sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
            {[1, 2, 3, 4, 5].map((i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="70%" height={24} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" width="80%" sx={{ mb: 1 }} />
            ))}
            <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 3, borderRadius: 1 }} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);
