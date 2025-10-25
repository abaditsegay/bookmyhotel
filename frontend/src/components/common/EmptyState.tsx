import React from 'react';
import { Box, Typography, Button, SxProps, Theme } from '@mui/material';
import {
  SearchOff as SearchOffIcon,
  ShoppingCart as ShoppingCartIcon,
  EventBusy as EventBusyIcon,
  Hotel as HotelIcon,
  Receipt as ReceiptIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained';
  };
  sx?: SxProps<Theme>;
}

/**
 * Reusable empty state component
 * Shows when lists or content areas have no data
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  sx,
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 2,
        ...sx,
      }}
    >
      {icon && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            color: 'text.disabled',
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: 'text.primary',
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: action ? 3 : 0,
          maxWidth: 400,
          mx: 'auto',
        }}
      >
        {message}
      </Typography>
      {action && (
        <Button
          variant={action.variant || 'contained'}
          onClick={action.onClick}
          size="large"
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

/**
 * Pre-configured empty state variants for common scenarios
 */

export const NoSearchResults: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
  <EmptyState
    icon={<SearchOffIcon sx={{ fontSize: 64 }} />}
    title="No results found"
    message="We couldn't find any matches for your search. Try adjusting your filters or search terms."
    action={onReset ? {
      label: 'Clear Filters',
      onClick: onReset,
      variant: 'outlined',
    } : undefined}
  />
);

export const NoBookings: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<EventBusyIcon sx={{ fontSize: 64 }} />}
    title="No bookings yet"
    message="You don't have any bookings. Start exploring hotels and make your first reservation!"
    action={onCreate ? {
      label: 'Search Hotels',
      onClick: onCreate,
    } : undefined}
  />
);

export const NoOrders: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<ShoppingCartIcon sx={{ fontSize: 64 }} />}
    title="No orders yet"
    message="There are no orders to display. Start creating orders to see them here."
    action={onCreate ? {
      label: 'Create Order',
      onClick: onCreate,
    } : undefined}
  />
);

export const NoProducts: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<InboxIcon sx={{ fontSize: 64 }} />}
    title="No products available"
    message="No products have been added yet. Add products to start selling."
    action={onCreate ? {
      label: 'Add Product',
      onClick: onCreate,
    } : undefined}
  />
);

export const NoHotels: React.FC<{ onRegister?: () => void }> = ({ onRegister }) => (
  <EmptyState
    icon={<HotelIcon sx={{ fontSize: 64 }} />}
    title="No hotels found"
    message="There are no hotels matching your criteria. Try expanding your search or check back later."
    action={onRegister ? {
      label: 'Register Your Hotel',
      onClick: onRegister,
      variant: 'outlined',
    } : undefined}
  />
);

export const NoReceipts: React.FC = () => (
  <EmptyState
    icon={<ReceiptIcon sx={{ fontSize: 64 }} />}
    title="No receipts"
    message="No receipts to display at this time."
  />
);

export const NoData: React.FC<{ title?: string; message?: string }> = ({ 
  title = "No data available", 
  message = "There's nothing to display right now." 
}) => (
  <EmptyState
    icon={<InfoIcon sx={{ fontSize: 64 }} />}
    title={title}
    message={message}
  />
);

// Export individual icon components for custom empty states
export const EmptyStateIcons = {
  SearchOff: SearchOffIcon,
  ShoppingCart: ShoppingCartIcon,
  EventBusy: EventBusyIcon,
  Hotel: HotelIcon,
  Receipt: ReceiptIcon,
  Inbox: InboxIcon,
  Info: InfoIcon,
};
