import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  Grid,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Assignment,
  PriorityHigh,
  Person,
  Build,
  LocationOn,
  AttachMoney
} from '@mui/icons-material';

interface MaintenanceTask {
  id: number;
  taskType: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  location?: string;
  equipmentType?: string;
  estimatedCost?: number;
  actualCost?: number;
  assignedStaff?: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  room?: {
    roomNumber: string;
    floor: number;
  };
  workPerformed?: string;
  partsUsed?: string;
}

interface MaintenanceTaskCardProps {
  task: MaintenanceTask;
  onAssign?: (taskId: number) => void;
  onStart?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  onViewDetails?: (taskId: number) => void;
  currentUserRole: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent':
    case 'critical':
      return 'error';
    case 'high':
      return 'warning';
    case 'normal':
      return 'info';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'default';
    case 'assigned':
      return 'primary';
    case 'in_progress':
      return 'warning';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const formatTaskType = (taskType: string) => {
  return taskType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const MaintenanceTaskCard: React.FC<MaintenanceTaskCardProps> = ({
  task,
  onAssign,
  onStart,
  onComplete,
  onViewDetails,
  currentUserRole
}) => {
  const canAssign = currentUserRole === 'OPERATIONS_SUPERVISOR' && task.status === 'PENDING';
  const canStart = (currentUserRole === 'MAINTENANCE' || currentUserRole === 'OPERATIONS_SUPERVISOR') && 
                   task.status === 'ASSIGNED';
  const canComplete = (currentUserRole === 'MAINTENANCE' || currentUserRole === 'OPERATIONS_SUPERVISOR') && 
                      task.status === 'IN_PROGRESS';

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      {/* Priority Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        {task.priority === 'URGENT' && (
          <Tooltip title="Urgent Priority">
            <PriorityHigh color="error" />
          </Tooltip>
        )}
        <Chip 
          label={task.priority}
          size="small"
          color={getPriorityColor(task.priority) as any}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 4 }}>
        {/* Task Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Build sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            {task.title}
          </Typography>
        </Box>

        {/* Location and Room Information */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {task.room && (
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Room
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {task.room.roomNumber} (Floor {task.room.floor})
              </Typography>
            </Grid>
          )}
          {task.location && (
            <Grid item xs={task.room ? 6 : 12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2">
                  {task.location}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Task Type and Status */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Task Type
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatTaskType(task.taskType)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Chip 
              label={task.status.replace(/_/g, ' ')}
              size="small"
              color={getStatusColor(task.status) as any}
            />
          </Grid>
        </Grid>

        {/* Description */}
        {task.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body2">
              {task.description}
            </Typography>
          </Box>
        )}

        {/* Equipment Type */}
        {task.equipmentType && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Equipment Type
            </Typography>
            <Typography variant="body2">
              {task.equipmentType}
            </Typography>
          </Box>
        )}

        {/* Assigned Staff */}
        {task.assignedStaff && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Person sx={{ mr: 1, fontSize: '1rem' }} />
            <Typography variant="body2">
              Assigned to: {task.assignedStaff.user.firstName} {task.assignedStaff.user.lastName}
            </Typography>
          </Box>
        )}

        {/* Cost Information */}
        {(task.estimatedCost || task.actualCost) && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney sx={{ mr: 0.5, fontSize: '1rem' }} />
              <Typography variant="body2" color="text.secondary">
                Cost Information
              </Typography>
            </Box>
            {task.estimatedCost && (
              <Typography variant="body2">
                Estimated: ${task.estimatedCost.toFixed(2)}
              </Typography>
            )}
            {task.actualCost && (
              <Typography variant="body2">
                Actual: ${task.actualCost.toFixed(2)}
              </Typography>
            )}
          </Box>
        )}

        {/* Work Performed */}
        {task.workPerformed && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Work Performed
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {task.workPerformed}
            </Typography>
          </Box>
        )}

        {/* Parts Used */}
        {task.partsUsed && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Parts Used
            </Typography>
            <Typography variant="body2">
              {task.partsUsed}
            </Typography>
          </Box>
        )}

        {/* Created At */}
        <Typography variant="caption" color="text.secondary">
          Created: {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString()}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onViewDetails?.(task.id)}
          startIcon={<Assignment />}
        >
          Details
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {canAssign && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => onAssign?.(task.id)}
              startIcon={<Person />}
            >
              Assign
            </Button>
          )}

          {canStart && (
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={() => onStart?.(task.id)}
              startIcon={<PlayArrow />}
            >
              Start
            </Button>
          )}

          {canComplete && (
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => onComplete?.(task.id)}
              startIcon={<CheckCircle />}
            >
              Complete
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default MaintenanceTaskCard;
