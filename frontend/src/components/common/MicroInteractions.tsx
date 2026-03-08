import React from 'react';
import {
  Box,
  useTheme,
  keyframes,
  ButtonBase,
  Typography,
} from '@mui/material';
import { designSystem } from '../../theme/designSystem';
import { COLORS, addAlpha } from '../../theme/themeColors';

// Enhanced micro-interaction animations
const rippleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 ${addAlpha(COLORS.BOOKED, 0.4)};
  }
  70% {
    box-shadow: 0 0 0 10px ${addAlpha(COLORS.BOOKED, 0)};
  }
  100% {
    box-shadow: 0 0 0 0 ${addAlpha(COLORS.BOOKED, 0)};
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'hover-lift' | 'hover-glow' | 'hover-scale' | 'float' | 'shimmer';
  disabled?: boolean;
  className?: string;
  sx?: any;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  onClick,
  variant = 'hover-lift',
  disabled = false,
  className,
  sx = {},
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    const baseStyles = {
      position: 'relative' as const,
      overflow: 'hidden',
      borderRadius: designSystem.borderRadius.lg,
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: onClick && !disabled ? 'pointer' : 'default',
      ...(disabled && {
        opacity: 0.6,
        cursor: 'not-allowed',
      }),
    };

    switch (variant) {
      case 'hover-lift':
        return {
          ...baseStyles,
          '&:hover': !disabled ? {
            transform: 'translateY(-8px)',
            boxShadow: designSystem.shadows.xl,
            borderColor: theme.palette.primary.main,
          } : {},
        };

      case 'hover-glow':
        return {
          ...baseStyles,
          '&:hover': !disabled ? {
            boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
            borderColor: theme.palette.primary.main,
            animation: `${pulseGlow} 2s infinite`,
          } : {},
        };

      case 'hover-scale':
        return {
          ...baseStyles,
          '&:hover': !disabled ? {
            transform: 'scale(1.02)',
            boxShadow: designSystem.shadows.lg,
          } : {},
        };

      case 'float':
        return {
          ...baseStyles,
          animation: `${floatAnimation} 3s ease-in-out infinite`,
        };

      case 'shimmer':
        return {
          ...baseStyles,
          background: `linear-gradient(90deg, ${theme.palette.background.paper} 25%, ${theme.palette.grey[100]} 50%, ${theme.palette.background.paper} 75%)`,
          backgroundSize: '1000px 100%',
          animation: `${shimmer} 2s infinite linear`,
        };

      default:
        return baseStyles;
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (disabled || !onClick) return;

    // Create ripple effect
    const rect = event.currentTarget.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: ${addAlpha(COLORS.BOOKED, 0.3)};
      border-radius: 50%;
      pointer-events: none;
      animation: ${rippleAnimation} 0.6s ease-out;
    `;

    event.currentTarget.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    onClick();
  };

  if (onClick) {
    return (
      <ButtonBase
        onClick={handleClick}
        disabled={disabled}
        className={className}
        sx={[getVariantStyles(), sx]}
        disableRipple
      >
        {children}
      </ButtonBase>
    );
  }

  return (
    <Box
      className={className}
      sx={[getVariantStyles(), sx]}
    >
      {children}
    </Box>
  );
};

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, displayValue]);

  return (
    <Typography
      variant="inherit"
      component="span"
      sx={{
        fontVariantNumeric: 'tabular-nums',
        transition: 'color 0.3s ease',
      }}
    >
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </Typography>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  animated?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  height?: number;
  showLabel?: boolean;
}

const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  animated = true,
  color = 'primary',
  height = 8,
  showLabel = false,
}) => {
  const theme = useTheme();
  const [animatedValue, setAnimatedValue] = React.useState(0);

  React.useEffect(() => {
    if (animated) {
      const timeout = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setAnimatedValue(value);
    }
  }, [value, animated]);

  const percentage = Math.min((animatedValue / max) * 100, 100);

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          height,
          backgroundColor: theme.palette.grey[200],
          borderRadius: height / 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: theme.palette[color].main,
            borderRadius: height / 2,
            transition: animated ? 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
          }}
        />
      </Box>
      {showLabel && (
        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            textAlign: 'center',
            color: theme.palette.text.secondary,
          }}
        >
          {Math.round(percentage)}%
        </Typography>
      )}
    </Box>
  );
};

export { InteractiveCard, AnimatedCounter, AnimatedProgressBar };