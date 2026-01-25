import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { operationsSupervisorApi } from '../../services/operationsSupervisorApi';
import { HousekeepingTask, HousekeepingStaff, StaffPerformance } from '../../types/operations';
import { COLORS, addAlpha } from '../../theme/themeColors';

interface StaffTasksDialogProps {
  open: boolean;
  onClose: () => void;
  staff: HousekeepingStaff | null;
}

const StaffTasksDialog: React.FC<StaffTasksDialogProps> = ({
  open,
  onClose,
  staff
}) => {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [performance, setPerformance] = useState<StaffPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStaffData = async () => {
      if (!staff) return;

      setLoading(true);
      setError(null);
      
      try {
        const [tasksData, performanceData] = await Promise.all([
          operationsSupervisorApi.getStaffTasks(staff.id),
          operationsSupervisorApi.getStaffPerformance(staff.id)
        ]);
        
        setTasks(tasksData);
        setPerformance(performanceData);
      } catch (err) {
        setError('Failed to load staff data');
        console.error('Load staff data error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (open && staff) {
      loadStaffData();
    }
  }, [open, staff]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'assigned': case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ 
        textAlign: 'center', 
        color: COLORS.PRIMARY,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        Staff Tasks - {staff?.user.firstName} {staff?.user.lastName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Performance Summary */}
            {performance && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.PRIMARY }}>
                  Performance Summary
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mb: 2,
                  p: 2,
                  backgroundColor: addAlpha(COLORS.PRIMARY, 0.05),
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: addAlpha(COLORS.PRIMARY, 0.2)
                }}>
                  <Typography variant="body2">
                    <strong>Tasks Completed:</strong> {performance.tasksCompleted}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Average Rating:</strong> {performance.averageRating.toFixed(1)}/5
                  </Typography>
                  <Typography variant="body2">
                    <strong>Efficiency:</strong> {performance.efficiency}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Hours:</strong> {performance.totalHours}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Tasks Table */}
            <Typography variant="h6" gutterBottom sx={{ color: COLORS.PRIMARY }}>
              Recent Tasks
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
                      boxShadow: '0 4px 12px rgba(100, 116, 139, 0.15)',
                      '& .MuiTableCell-head': {
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        border: 'none',
                        padding: '20px 16px',
                        position: 'relative',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 100%)'
                        }
                      }
                    }}
                  >
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Completion Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.taskType}</TableCell>
                      <TableCell>{task.roomNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={task.priority} 
                          color={getStatusColor(task.priority)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.status} 
                          color={getStatusColor(task.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {task.completionTime ? new Date(task.completionTime).toLocaleString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {tasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No tasks found for this staff member
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: COLORS.PRIMARY,
            color: COLORS.PRIMARY,
            '&:hover': {
              backgroundColor: addAlpha(COLORS.PRIMARY, 0.1),
              borderColor: COLORS.PRIMARY
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffTasksDialog;