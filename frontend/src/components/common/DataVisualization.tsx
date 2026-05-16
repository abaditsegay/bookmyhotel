import React, { useState } from 'react';
import {
  alpha,
  Box,
  Paper,
  Typography,
  useTheme,
  Card,
  CardContent,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { designSystem } from '../../theme/designSystem';
import { AnimatedCounter } from './MicroInteractions';
import { getReadableAccentTextColor } from '../../theme/surfaces';
import { composeSx, surfaceCardSx } from '../../theme/sxHelpers';

const sharedSurfaceRadius = Math.max(4, designSystem.borderRadius.sm / 2);

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export interface MetricCardProps {
  title: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  format?: 'number' | 'currency' | 'percentage';
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

export interface BarChartProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  showValues?: boolean;
  animated?: boolean;
}

export interface DonutChartProps {
  data: ChartDataPoint[];
  title?: string;
  size?: number;
  thickness?: number;
  showPercentages?: boolean;
  centerText?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  format = 'number',
  icon,
  color = 'primary',
  subtitle,
}) => {
  const theme = useTheme();
  const metricAccentColor = getReadableAccentTextColor(theme, color);
  const metricSurface = alpha(metricAccentColor, theme.palette.mode === 'dark' ? 0.12 : 0.05);
  const metricBorder = alpha(metricAccentColor, theme.palette.mode === 'dark' ? 0.26 : 0.14);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: theme.palette.error.main }} />;
      case 'neutral':
        return <TrendingFlatIcon sx={{ color: theme.palette.text.secondary }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Card
      sx={composeSx(surfaceCardSx('subtle'), {
        height: '100%',
        backgroundColor: metricSurface,
        border: `1px solid ${metricBorder}`,
        transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'none',
          backgroundColor: alpha(metricAccentColor, theme.palette.mode === 'dark' ? 0.18 : 0.08),
          borderColor: alpha(metricAccentColor, theme.palette.mode === 'dark' ? 0.36 : 0.2),
        },
      })}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box sx={{ color: metricAccentColor, opacity: 0.85 }}>
              {icon}
            </Box>
          )}
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: metricAccentColor,
            mb: 1,
          }}
        >
          <AnimatedCounter value={value} prefix={format === 'currency' ? 'ETB ' : ''} suffix={format === 'percentage' ? '%' : ''} />
        </Typography>

        {trend && trendValue !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getTrendIcon()}
            <Typography 
              variant="body2" 
              sx={{ 
                color: getTrendColor(),
                fontWeight: 600,
              }}
            >
              {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 200,
  showValues = true,
  animated = true,
}) => {
  const theme = useTheme();
  const fallbackAccent = getReadableAccentTextColor(theme);
  const [animationProgress, setAnimationProgress] = useState(0);

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimationProgress(100), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimationProgress(100);
    }
  }, [animated]);

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Paper
      sx={composeSx(surfaceCardSx('default'), { p: 3 })}
    >
      {title && (
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      
      <Box sx={{ height, display: 'flex', alignItems: 'end', gap: 2 }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 40);
          const animatedHeight = (barHeight * animationProgress) / 100;
          
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                gap: 1,
              }}
            >
              {showValues && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600,
                    color: item.color || fallbackAccent,
                  }}
                >
                  {item.value.toLocaleString()}
                </Typography>
              )}
              
              <Tooltip title={`${item.label}: ${item.value.toLocaleString()}`}>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 40,
                    height: animatedHeight,
                    backgroundColor: item.color || fallbackAccent,
                    borderRadius: `${sharedSurfaceRadius}px ${sharedSurfaceRadius}px 0 0`,
                    transition: animated ? 'height 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                />
              </Tooltip>
              
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  size = 200,
  thickness = 20,
  showPercentages = true,
  centerText,
}) => {
  const theme = useTheme();
  const fallbackAccent = getReadableAccentTextColor(theme);
  const [animationProgress, setAnimationProgress] = useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimationProgress(100), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <Paper
      sx={composeSx(surfaceCardSx('default'), {
        p: 3,
        textAlign: 'center',
      })}
    >
      {title && (
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.14 : 0.1)}
            strokeWidth={thickness}
          />
          
          {/* Data segments */}
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${(percentage / 100) * circumference * (animationProgress / 100)} ${circumference}`;
            const strokeDashoffset = -currentOffset * (animationProgress / 100);
            
            currentOffset += (percentage / 100) * circumference;
            
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color || fallbackAccent}
                strokeWidth={thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: `${size / 2}px ${size / 2}px`,
                  transition: 'stroke-dasharray 1s ease-in-out, stroke-dashoffset 1s ease-in-out',
                }}
              />
            );
          })}
        </svg>
        
        {/* Center text */}
        {centerText && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {centerText}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: item.color || fallbackAccent,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {item.label}
                {showPercentages && ` (${percentage}%)`}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

const ProgressChart: React.FC<{
  data: ChartDataPoint[];
  title?: string;
}> = ({ data, title }) => {
  const theme = useTheme();
  const fallbackAccent = getReadableAccentTextColor(theme);

  return (
    <Paper
      sx={composeSx(surfaceCardSx('default'), { p: 3 })}
    >
      {title && (
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {data.map((item, index) => (
          <Box key={index}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.value}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.value}
              sx={{
                height: 8,
                borderRadius: sharedSurfaceRadius,
                backgroundColor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.14 : 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: sharedSurfaceRadius,
                  backgroundColor: item.color || fallbackAccent,
                },
              }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export { MetricCard, BarChart, DonutChart, ProgressChart };