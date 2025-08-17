import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Refresh, CheckCircle, Cancel, Visibility } from '@mui/icons-material';

interface HotelRegistration {
  id: number;
  hotelName: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  contactEmail: string;
  contactPerson: string;
  licenseNumber: string;
  taxId: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  reviewComments?: string;
  approvedHotelId?: number;
  tenantId?: string;
}

interface RegistrationStatistics {
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  total: number;
}

const HotelRegistrationAdmin: React.FC = () => {
  const [registrations, setRegistrations] = useState<HotelRegistration[]>([]);
  const [statistics, setStatistics] = useState<RegistrationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<HotelRegistration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view'>('view');
  const [comments, setComments] = useState('');
  const [tenantId, setTenantId] = useState('');

  const statusColors = {
    PENDING: 'warning',
    UNDER_REVIEW: 'info',
    APPROVED: 'success',
    REJECTED: 'error',
    CANCELLED: 'default',
  } as const;

  useEffect(() => {
    fetchRegistrations();
    fetchStatistics();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/hotel-registrations');
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.content || data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/hotel-registrations/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleAction = async () => {
    if (!selectedRegistration) return;

    try {
      const endpoint = actionType === 'approve' 
        ? `/api/admin/hotel-registrations/${selectedRegistration.id}/approve`
        : `/api/admin/hotel-registrations/${selectedRegistration.id}/reject`;

      const body = actionType === 'approve' 
        ? { comments, tenantId }
        : { reason: comments };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setDialogOpen(false);
        setComments('');
        setTenantId('');
        fetchRegistrations();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error processing action:', error);
    }
  };

  const openDialog = (registration: HotelRegistration, type: 'approve' | 'reject' | 'view') => {
    setSelectedRegistration(registration);
    setActionType(type);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hotel Registration Management
      </Typography>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h4">
                  {statistics.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {statistics.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Under Review
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statistics.underReview}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.approved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h4" color="error.main">
                  {statistics.rejected}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Actions */}
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={fetchRegistrations}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Registration Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hotel Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {registration.hotelName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {registration.address}
                  </Typography>
                </TableCell>
                <TableCell>{registration.contactPerson}</TableCell>
                <TableCell>{registration.contactEmail}</TableCell>
                <TableCell>{registration.city}, {registration.country}</TableCell>
                <TableCell>
                  <Chip 
                    label={registration.status} 
                    color={statusColors[registration.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(registration.submittedAt)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => openDialog(registration, 'view')}
                    >
                      View
                    </Button>
                    {registration.status === 'PENDING' && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => openDialog(registration, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => openDialog(registration, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'view' && 'Hotel Registration Details'}
          {actionType === 'approve' && 'Approve Registration'}
          {actionType === 'reject' && 'Reject Registration'}
        </DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Hotel Name</Typography>
                  <Typography variant="body1">{selectedRegistration.hotelName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Contact Person</Typography>
                  <Typography variant="body1">{selectedRegistration.contactPerson}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body1">{selectedRegistration.description}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Address</Typography>
                  <Typography variant="body1">
                    {selectedRegistration.address}, {selectedRegistration.city}, {selectedRegistration.country}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Phone</Typography>
                  <Typography variant="body1">{selectedRegistration.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography variant="body1">{selectedRegistration.contactEmail}</Typography>
                </Grid>
                {selectedRegistration.licenseNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">License Number</Typography>
                    <Typography variant="body1">{selectedRegistration.licenseNumber}</Typography>
                  </Grid>
                )}
                {selectedRegistration.taxId && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Tax ID</Typography>
                    <Typography variant="body1">{selectedRegistration.taxId}</Typography>
                  </Grid>
                )}
              </Grid>

              {actionType !== 'view' && (
                <Box sx={{ mt: 3 }}>
                  {actionType === 'approve' && (
                    <TextField
                      fullWidth
                      label="Tenant ID"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      required
                      sx={{ mb: 2 }}
                      helperText="Unique identifier for the hotel tenant"
                    />
                  )}
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={actionType === 'approve' ? 'Approval Comments' : 'Rejection Reason'}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    required={actionType === 'reject'}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {actionType !== 'view' && (
            <Button 
              onClick={handleAction} 
              variant="contained"
              color={actionType === 'approve' ? 'success' : 'error'}
              disabled={actionType === 'reject' && !comments.trim()}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HotelRegistrationAdmin;
