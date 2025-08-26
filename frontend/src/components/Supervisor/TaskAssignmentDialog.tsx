import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { operationsSupervisorApi } from '../../services/operationsSupervisorApi';
import { HousekeepingStaff, HousekeepingTask, MaintenanceRequest } from '../../types/operations';

interface TaskAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  task?: HousekeepingTask;
  maintenanceRequest?: MaintenanceRequest;
  onAssigned: () => void;
}

const TaskAssignmentDialog: React.FC<TaskAssignmentDialogProps> = ({
  open,
  onClose,
  task,
  maintenanceRequest,
  onAssigned
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<number | ''>('');
  const [staff, setStaff] = useState<HousekeepingStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadStaff();
    }
  }, [open]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const staffData = await operationsSupervisorApi.getStaff();
      setStaff(staffData.content);
    } catch (err) {
      setError('Failed to load staff');
      console.error('Load staff error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaffId) return;

    setLoading(true);
    setError(null);
    
    try {
      if (task) {
        await operationsSupervisorApi.assignHousekeepingTask(task.id, selectedStaffId as number);
      } else if (maintenanceRequest) {
        await operationsSupervisorApi.assignMaintenanceRequest(maintenanceRequest.id, selectedStaffId as number);
      }
      
      onAssigned();
      onClose();
      setSelectedStaffId('');
    } catch (err) {
      setError('Failed to assign task');
      console.error('Assign error:', err);
    } finally {
      setLoading(false);
    }
  };

  const itemTitle = task ? task.title : maintenanceRequest?.title || '';
  const itemType = task ? 'Housekeeping Task' : 'Maintenance Request';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign {itemType}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {itemType}: {itemTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {task?.description || maintenanceRequest?.description}
          </Typography>
        </Box>

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
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Staff Member</InputLabel>
            <Select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value as number)}
              label="Select Staff Member"
            >
              {staff.map((staffMember) => (
                <MenuItem key={staffMember.id} value={staffMember.id}>
                  {staffMember.user.firstName} {staffMember.user.lastName} - {staffMember.user.role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleAssign} 
          variant="contained" 
          disabled={!selectedStaffId || loading}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskAssignmentDialog;