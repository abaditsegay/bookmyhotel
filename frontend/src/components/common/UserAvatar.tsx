import React from 'react';
import { Avatar, Box, useTheme } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { COLORS, addAlpha } from '../../theme/themeColors';

interface UserAvatarProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string; // For future implementation
  };
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'rounded' | 'square';
  showOnlineStatus?: boolean;
  showBorder?: boolean;
  customColor?: string;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'medium', 
  variant = 'circular',
  showOnlineStatus = false,
  showBorder = true,
  customColor,
  onClick 
}) => {
  const theme = useTheme();
  
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, fontSize: '0.8rem' };
      case 'large':
        return { width: 48, height: 48, fontSize: '1.2rem' };
      default:
        return { width: 40, height: 40, fontSize: '1rem' };
    }
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return null;
  };

  const getBackgroundGradient = () => {
    if (customColor) return customColor;
    
    // Generate different blue gradients based on user's first letter for variety
    const initials = getInitials();
    if (!initials) return `linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.SECONDARY} 100%)`;
    
    const gradients = [
      `linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.SECONDARY} 100%)`, // Primary to Secondary
      `linear-gradient(135deg, ${COLORS.SECONDARY} 0%, ${addAlpha(COLORS.PRIMARY, 0.7)} 100%)`, // Secondary to light Primary
      `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.8)} 0%, ${COLORS.PRIMARY} 100%)`, // Light Primary to Primary
      `linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${addAlpha(COLORS.SECONDARY, 0.8)} 100%)`, // Primary to light Secondary
      `linear-gradient(135deg, ${addAlpha(COLORS.SECONDARY, 0.9)} 0%, ${COLORS.PRIMARY} 100%)`, // Very light Secondary to Primary
      `linear-gradient(135deg, ${COLORS.SECONDARY} 0%, ${COLORS.PRIMARY} 100%)`, // Secondary to Primary
      `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.6)} 0%, ${addAlpha(COLORS.SECONDARY, 0.8)} 100%)`, // Light variations
      `linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${addAlpha(COLORS.PRIMARY, 0.5)} 100%)`, // Primary to very light Primary
    ];
    
    const index = initials.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const { width, height, fontSize } = getSizeProps();
  const initials = getInitials();

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        src={user.profilePicture} // Will be used when profile pictures are implemented
        onClick={onClick}
        variant={variant}
        sx={{
          width,
          height,
          fontSize,
          fontWeight: 'bold',
          background: user.profilePicture 
            ? 'transparent' 
            : getBackgroundGradient(),
          border: showBorder ? `2px solid ${theme.palette.background.paper}` : 'none',
          boxShadow: theme.shadows[2],
          transition: 'all 0.2s ease',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            transform: 'scale(1.05)',
            boxShadow: theme.shadows[4],
          } : {},
        }}
      >
        {!user.profilePicture && (initials || <PersonIcon sx={{ fontSize: fontSize }} />)}
      </Avatar>
      
      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <Box
          sx={{
            position: 'absolute',
            bottom: variant === 'square' ? 2 : 0,
            right: variant === 'square' ? 2 : 0,
            width: width * 0.25,
            height: width * 0.25,
            backgroundColor: theme.palette.success.main,
            borderRadius: '50%',
            border: `2px solid ${theme.palette.background.paper}`,
            zIndex: 1,
          }}
        />
      )}
    </Box>
  );
};

export default UserAvatar;
