import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Pagination,
  Grid,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { roomChargeApiService } from '../../services/roomChargeApi';
import { RoomCharge, RoomChargeCreateRequest, RoomChargeType } from '../../types/shop';

interface RoomChargesProps {
  hotelId: number;
}

const RoomChargesManagement: React.FC<RoomChargesProps> = ({ hotelId }) => {
  const [roomCharges, setRoomCharges] = useState<RoomCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<RoomCharge | null>(null);
  const [chargeToDelete, setChargeToDelete] = useState<RoomCharge | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  
  // Form state for creating new charges
  const [newCharge, setNewCharge] = useState<RoomChargeCreateRequest>({
    reservationId: 0,
    description: '',
    amount: 0,
    chargeType: RoomChargeType.OTHER,
    notes: ''
  });

  const pageSize = 20;

  useEffect(() => {
    loadRoomCharges();
  }, [hotelId, page, searchTerm]); // loadRoomCharges is not included to avoid infinite loop

  const loadRoomCharges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchTerm.trim()) {
        response = await roomChargeApiService.searchRoomCharges(hotelId, searchTerm, page, pageSize);
      } else {
        response = await roomChargeApiService.getRoomChargesForHotel(hotelId, page, pageSize);
      }
      
      setRoomCharges(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load room charges');
      console.error('Failed to load room charges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCharge = async () => {
    try {
      await roomChargeApiService.createRoomCharge(newCharge);
      setCreateDialogOpen(false);
      setNewCharge({
        reservationId: 0,
        description: '',
        amount: 0,
        chargeType: RoomChargeType.OTHER,
        notes: ''
      });
      loadRoomCharges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room charge');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedCharge) return;
    
    try {
      await roomChargeApiService.markChargeAsPaid(selectedCharge.id, paymentReference);
      setPaymentDialogOpen(false);
      setSelectedCharge(null);
      setPaymentReference('');
      loadRoomCharges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark charge as paid');
    }
  };

  const handleMarkAsUnpaid = async (chargeId: number) => {
    try {
      await roomChargeApiService.markChargeAsUnpaid(chargeId);
      loadRoomCharges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark charge as unpaid');
    }
  };

  const handleDeleteCharge = async (charge: RoomCharge) => {
    setChargeToDelete(charge);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCharge = async () => {
    if (!chargeToDelete) return;
    
    try {
      await roomChargeApiService.deleteRoomCharge(chargeToDelete.id);
      setDeleteDialogOpen(false);
      setChargeToDelete(null);
      loadRoomCharges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room charge');
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
    loadRoomCharges();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const getChargeTypeColor = (chargeType: RoomChargeType): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (chargeType) {
      case RoomChargeType.SHOP_PURCHASE:
        return 'primary';
      case RoomChargeType.RESTAURANT:
      case RoomChargeType.ROOM_SERVICE:
        return 'success';
      case RoomChargeType.SPA:
      case RoomChargeType.LAUNDRY:
        return 'secondary';
      case RoomChargeType.DAMAGE:
      case RoomChargeType.CLEANING:
        return 'error';
      default:
        return 'warning';
    }
  };

  const chargeTypeOptions = Object.values(RoomChargeType);

  if (loading && roomCharges.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading room charges...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          Room Charges Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Room Charge
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Search by guest name or room number"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  type="submit"
                  variant="outlined"
                  fullWidth
                  startIcon={<FilterIcon />}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" color="primary">
                {totalElements}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Charges
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" color="success.main">
                {roomCharges.filter(charge => charge.isPaid).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid Charges
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" color="warning.main">
                {roomCharges.filter(charge => !charge.isPaid).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unpaid Charges
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" color="text.primary">
                {formatCurrency(roomCharges.reduce((sum, charge) => sum + charge.amount, 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Room Charges Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Guest</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomCharges.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell>
                      {formatDate(charge.chargeDate)}
                    </TableCell>
                    <TableCell>
                      {charge.guestName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {charge.roomNumber || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {charge.description}
                      </Typography>
                      {charge.notes && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {charge.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={charge.chargeType.replace('_', ' ')}
                        color={getChargeTypeColor(charge.chargeType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(charge.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={charge.isPaid ? 'Paid' : 'Unpaid'}
                        color={charge.isPaid ? 'success' : 'warning'}
                        size="small"
                      />
                      {charge.isPaid && charge.paidAt && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatDate(charge.paidAt)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {!charge.isPaid ? (
                          <Tooltip title="Mark as Paid">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedCharge(charge);
                                setPaymentDialogOpen(true);
                              }}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Mark as Unpaid">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleMarkAsUnpaid(charge.id)}
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCharge(charge)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, newPage) => setPage(newPage - 1)}
                color="primary"
              />
            </Box>
          )}

          {roomCharges.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No room charges found.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Charge Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Room Charge</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Reservation ID"
              type="number"
              value={newCharge.reservationId || ''}
              onChange={(e) => setNewCharge({ ...newCharge, reservationId: parseInt(e.target.value) || 0 })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={newCharge.description}
              onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
              required
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Amount"
              type="number"
              value={newCharge.amount || ''}
              onChange={(e) => setNewCharge({ ...newCharge, amount: parseFloat(e.target.value) || 0 })}
              required
              fullWidth
              inputProps={{
                step: 0.01,
                min: 0
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Charge Type</InputLabel>
              <Select
                value={newCharge.chargeType}
                label="Charge Type"
                onChange={(e) => setNewCharge({ ...newCharge, chargeType: e.target.value as RoomChargeType })}
              >
                {chargeTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Notes (Optional)"
              value={newCharge.notes}
              onChange={(e) => setNewCharge({ ...newCharge, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCharge}
            variant="contained"
            disabled={!newCharge.reservationId || !newCharge.description || !newCharge.amount}
          >
            Create Charge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Charge as Paid</DialogTitle>
        <DialogContent>
          {selectedCharge && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Charge:</strong> {selectedCharge.description}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Amount:</strong> {formatCurrency(selectedCharge.amount)}
              </Typography>
              <TextField
                label="Payment Reference (Optional)"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
                placeholder="e.g., Credit Card, Cash, Invoice #12345"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMarkAsPaid} variant="contained" color="success">
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Room Charge</DialogTitle>
        <DialogContent>
          {chargeToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to delete this room charge?
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Guest:</strong> {chargeToDelete.guestName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Room:</strong> {chargeToDelete.roomNumber || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Description:</strong> {chargeToDelete.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Amount:</strong> {formatCurrency(chargeToDelete.amount)}
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                This action cannot be undone.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteCharge} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomChargesManagement;
