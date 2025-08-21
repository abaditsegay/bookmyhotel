import React from 'react';
import { Avatar, Box } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

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
    
    // Generate different gradients based on user's first letter for variety
    const initials = getInitials();
    if (!initials) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple-Blue
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Red
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue-Cyan
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Teal
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Teal-Pink
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Pink-Light Pink
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Purple-Pink
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
          border: showBorder ? '2px solid rgba(255, 255, 255, 0.2)' : 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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
            backgroundColor: '#4caf50',
            borderRadius: '50%',
            border: '2px solid white',
            zIndex: 1,
          }}
        />
      )}
    </Box>
  );
};

export default UserAvatar;
