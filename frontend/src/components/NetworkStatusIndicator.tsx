/**
 * Network Status Indicator Component
 * Displays real-time network connectivity status and offline sync information
 */

import React, { useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Button,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Sync as SyncIcon,
  SyncProblem as SyncProblemIcon,
  Storage as StorageIcon,
  CloudOff as CloudOffIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  GetApp as GetAppIcon,
  DeleteSweep as DeleteSweepIcon,

} from '@mui/icons-material';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useAuth } from '../contexts/AuthContext';

interface NetworkStatusIndicatorProps {
  variant?: 'detailed' | 'minimal';
  className?: string;
  position?: 'top' | 'bottom';
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  variant = 'detailed',
  className,
  position = 'top'
}) => {
  const { token } = useAuth();
  const {
    networkStatus,
    isOnline,
    isSlowConnection,
    syncStatus,
    isSyncing,
    hasPendingSync,
    hasFailedSync,
    offlineStats,
    triggerSync,
    retryFailedBookings,
    clearOldBookings,
    exportOfflineData
  } = useNetworkStatus();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Menu handlers
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Action handlers
  const handleSync = useCallback(async () => {
    handleMenuClose();
    await triggerSync(token || undefined);
  }, [triggerSync, token, handleMenuClose]);

  const handleRetryFailed = useCallback(async () => {
    handleMenuClose();
    await retryFailedBookings(token || undefined);
  }, [retryFailedBookings, token, handleMenuClose]);

  const handleExport = useCallback(async () => {
    handleMenuClose();
    await exportOfflineData();
  }, [exportOfflineData, handleMenuClose]);

  const handleClearConfirm = useCallback(async () => {
    setConfirmClearOpen(false);
    handleMenuClose();
    await clearOldBookings(30);
  }, [clearOldBookings, handleMenuClose]);

  // Status determination
  const getStatusColor = useCallback(() => {
    if (!isOnline) return 'error';
    if (hasFailedSync) return 'warning';
    if (hasPendingSync) return 'info';
    if (isSlowConnection) return 'warning';
    return 'success';
  }, [isOnline, hasFailedSync, hasPendingSync, isSlowConnection]);

  const getStatusIcon = useCallback(() => {
    if (!isOnline) return <WifiOffIcon />;
    if (isSyncing) return <SyncIcon className="animate-spin" />;
    if (hasFailedSync) return <SyncProblemIcon />;
    if (hasPendingSync) return <CloudOffIcon />;
    if (isSlowConnection) return <WarningIcon />;
    return <WifiIcon />;
  }, [isOnline, isSyncing, hasFailedSync, hasPendingSync, isSlowConnection]);

  const getStatusText = useCallback(() => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Syncing...';
    if (hasFailedSync) return `${syncStatus.failedCount} failed`;
    if (hasPendingSync) return `${syncStatus.pendingCount} pending`;
    if (isSlowConnection) return 'Slow connection';
    return 'Online';
  }, [isOnline, isSyncing, hasFailedSync, hasPendingSync, isSlowConnection, syncStatus]);

  if (variant === 'minimal') {
    return (
      <Box className={className} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Status Chip */}
        <Tooltip title={`Network: ${getStatusText()}`}>
          <Chip
            icon={getStatusIcon()}
            label={getStatusText()}
            size="small"
            variant="filled"
            onClick={handleSync}
            disabled={!isOnline || isSyncing}
            style={{
              backgroundColor: !isOnline ? '#FFA500' : '#c8e6c8',
              color: !isOnline ? '#8B4513' : '#2e7d32',
              fontWeight: 'bold',
              border: `2px solid ${!isOnline ? '#8B4513' : '#4caf50'}`,
            }}
            sx={{
              '& .MuiChip-icon': {
                color: !isOnline ? '#8B4513 !important' : '#2e7d32 !important',
              },
              '& .MuiChip-label': {
                color: !isOnline ? '#8B4513 !important' : '#2e7d32 !important',
                fontWeight: 'bold !important',
              },
              '&:hover': {
                backgroundColor: !isOnline ? '#FF8C00 !important' : '#a5d6a7 !important',
              },
              '&.Mui-disabled': {
                backgroundColor: !isOnline ? '#FFA500 !important' : '#c8e6c8 !important',
                color: !isOnline ? '#8B4513 !important' : '#2e7d32 !important',
                opacity: '0.9 !important',
              }
            }}
          />
        </Tooltip>

        {/* Menu Button */}
        <Tooltip title="Network options">
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem 
            onClick={handleSync} 
            disabled={!isOnline || isSyncing}
          >
            <ListItemIcon><SyncIcon /></ListItemIcon>
            <ListItemText>Sync Now</ListItemText>
          </MenuItem>
          
          <MenuItem 
            onClick={handleRetryFailed} 
            disabled={!isOnline || !hasFailedSync || isSyncing}
          >
            <ListItemIcon><SyncProblemIcon /></ListItemIcon>
            <ListItemText>Retry Failed ({syncStatus.failedCount})</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleExport}>
            <ListItemIcon><GetAppIcon /></ListItemIcon>
            <ListItemText>Export Data</ListItemText>
          </MenuItem>
          
          <MenuItem 
            onClick={() => setConfirmClearOpen(true)}
            disabled={offlineStats.syncedBookings === 0}
          >
            <ListItemIcon><DeleteSweepIcon /></ListItemIcon>
            <ListItemText>Clear Old Bookings</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  // Detailed variant (for status bar)
  return (
    <AppBar 
      position={position === 'top' ? 'sticky' : 'fixed'}
      sx={{ 
        top: position === 'top' ? 0 : 'auto',
        bottom: position === 'bottom' ? 0 : 'auto',
        zIndex: 1300,
        backgroundColor: getStatusColor() === 'error' ? 'error.main' : 
                        getStatusColor() === 'warning' ? 'warning.main' : 'primary.main'
      }}
      className={className}
    >
      <Toolbar variant="dense" sx={{ minHeight: 48 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {/* Network Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon()}
            <Typography variant="body2">
              {getStatusText()}
            </Typography>
            {networkStatus.effectiveType !== 'unknown' && (
              <Chip 
                label={networkStatus.effectiveType.toUpperCase()} 
                size="small" 
                variant="outlined"
                sx={{ color: 'inherit', borderColor: 'currentColor' }}
              />
            )}
          </Box>

          {/* Sync Status */}
          {(hasPendingSync || hasFailedSync || isSyncing) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon />
              <Typography variant="body2">
                {offlineStats.totalBookings} local bookings
                {hasPendingSync && ` (${syncStatus.pendingCount} pending)`}
                {hasFailedSync && ` (${syncStatus.failedCount} failed)`}
              </Typography>
            </Box>
          )}

          {/* Sync Progress */}
          {isSyncing && (
            <LinearProgress 
              sx={{ 
                flex: 1, 
                maxWidth: 200,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(255,255,255,0.8)'
                }
              }} 
            />
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Sync Button */}
          <Tooltip title={isSyncing ? 'Syncing...' : 'Sync now'}>
            <IconButton
              color="inherit"
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              size="small"
            >
              <SyncIcon className={isSyncing ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>

          {/* Menu */}
          <IconButton color="inherit" onClick={handleMenuOpen} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Same menu as minimal variant */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleSync} 
          disabled={!isOnline || isSyncing}
        >
          <ListItemIcon><SyncIcon /></ListItemIcon>
          <ListItemText>Sync Now</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={handleRetryFailed} 
          disabled={!isOnline || !hasFailedSync || isSyncing}
        >
          <ListItemIcon><SyncProblemIcon /></ListItemIcon>
          <ListItemText>Retry Failed ({syncStatus.failedCount})</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleExport}>
          <ListItemIcon><GetAppIcon /></ListItemIcon>
          <ListItemText>Export Data</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => setConfirmClearOpen(true)}
          disabled={offlineStats.syncedBookings === 0}
        >
          <ListItemIcon><DeleteSweepIcon /></ListItemIcon>
          <ListItemText>Clear Old Bookings</ListItemText>
        </MenuItem>
      </Menu>

      {/* Clear Confirmation Dialog */}
      <Dialog 
        open={confirmClearOpen} 
        onClose={() => setConfirmClearOpen(false)}
      >
        <DialogTitle>Clear Old Bookings</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete all synced bookings older than 30 days. 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearOpen(false)}>Cancel</Button>
          <Button onClick={handleClearConfirm} color="error">
            Clear Old Bookings
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default NetworkStatusIndicator;