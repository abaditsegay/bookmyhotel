import React, { useState } from 'react';
import {
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
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette[color].main}15 0%, ${theme.palette[color].main}05 100%)`,
        border: `1px solid ${theme.palette[color].main}30`,
        borderRadius: designSystem.borderRadius.lg,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: designSystem.shadows.lg,
          borderColor: theme.palette[color].main,
        },
      }}
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
            <Box sx={{ color: theme.palette[color].main, opacity: 0.7 }}>
              {icon}
            </Box>
          )}
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: theme.palette[color].main,
            mb: 1,
          }}
        >
          <AnimatedCounter value={value} prefix={format === 'currency' ? '$' : ''} suffix={format === 'percentage' ? '%' : ''} />
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
      sx={{
        p: 3,
        borderRadius: designSystem.borderRadius.lg,
        border: `1px solid ${theme.palette.divider}`,
      }}
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
                    color: item.color || theme.palette.primary.main,
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
                    backgroundColor: item.color || theme.palette.primary.main,
                    borderRadius: `${designSystem.borderRadius.sm}px ${designSystem.borderRadius.sm}px 0 0`,
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
      sx={{
        p: 3,
        borderRadius: designSystem.borderRadius.lg,
        border: `1px solid ${theme.palette.divider}`,
        textAlign: 'center',
      }}
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
            stroke={theme.palette.grey[200]}
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
                stroke={item.color || theme.palette.primary.main}
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
                  backgroundColor: item.color || theme.palette.primary.main,
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

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: designSystem.borderRadius.lg,
        border: `1px solid ${theme.palette.divider}`,
      }}
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
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: item.color || theme.palette.primary.main,
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