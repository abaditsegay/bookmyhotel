import React from 'react';
import { useTranslation } from 'react-i18next';
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

export const NoSearchResults: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<SearchOffIcon sx={{ fontSize: 64 }} />}
      title={t('emptyStates.noSearchResults.title')}
      message={t('emptyStates.noSearchResults.message')}
      action={onReset ? {
        label: t('emptyStates.noSearchResults.action'),
        onClick: onReset,
        variant: 'outlined',
      } : undefined}
    />
  );
};

export const NoBookings: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<EventBusyIcon sx={{ fontSize: 64 }} />}
      title={t('emptyStates.noBookings.title')}
      message={t('emptyStates.noBookings.message')}
      action={onCreate ? {
        label: t('hotelSearch.form.searchButton'),
        onClick: onCreate,
      } : undefined}
    />
  );
};

export const NoOrders: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<ShoppingCartIcon sx={{ fontSize: 64 }} />}
      title={t('emptyStates.noOrders.title')}
      message={t('emptyStates.noOrders.message')}
      action={onCreate ? {
        label: t('emptyStates.noOrders.action'),
        onClick: onCreate,
      } : undefined}
    />
  );
};

export const NoProducts: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<InboxIcon sx={{ fontSize: 64 }} />}
      title={t('emptyStates.noProducts.title')}
      message={t('emptyStates.noProducts.message')}
      action={onCreate ? {
        label: t('emptyStates.noProducts.action'),
        onClick: onCreate,
      } : undefined}
    />
  );
};

export const NoHotels: React.FC<{ onRegister?: () => void }> = ({ onRegister }) => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<HotelIcon sx={{ fontSize: 64 }} />}
      title={t('emptyStates.noHotels.title')}
      message={t('emptyStates.noHotels.message')}
      action={onRegister ? {
        label: t('publicHotelRegistration.title'),
        onClick: onRegister,
        variant: 'outlined',
      } : undefined}
    />
  );
};

export const NoReceipts: React.FC = () => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<ReceiptIcon sx={{ fontSize: 64 }} />}
      title={t('emptyStates.noReceipts.title')}
      message={t('emptyStates.noReceipts.message')}
    />
  );
};

export const NoData: React.FC<{ title?: string; message?: string }> = ({ 
  title,
  message,
}) => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<InfoIcon sx={{ fontSize: 64 }} />}
      title={title || t('emptyStates.noDataTitle')}
      message={message || t('emptyStates.noDataMessage')}
    />
  );
};

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

// Default export
export default EmptyState;
