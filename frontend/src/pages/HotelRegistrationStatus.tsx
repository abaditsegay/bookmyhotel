import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Search,
  Hotel,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RegistrationStatus {
  id: number;
  hotelName: string;
  contactEmail: string;
  contactPerson: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewComments?: string;
}

const HotelRegistrationStatus: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registration, setRegistration] = useState<RegistrationStatus | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegistration(null);
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/public/hotel-registration/status?email=${encodeURIComponent(email.trim())}`);
      
      if (response.status === 404) {
        setError('No hotel registration found for this email address');
        return;
      }
      
      if (!response.ok) {
        const errorMessage = response.headers.get('Error-Message') || 'Failed to check registration status';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setRegistration(result);
      
    } catch (err: any) {
      console.error('Error checking registration status:', err);
      setError(err.message || 'Failed to check registration status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'pending':
      case 'under_review':
        return <HourglassEmpty sx={{ color: 'warning.main' }} />;
      case 'rejected':
        return <Cancel sx={{ color: 'error.main' }} />;
      default:
        return <Visibility sx={{ color: 'info.main' }} />;
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'under_review':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Check Registration Status
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter your email to check the status of your hotel registration
          </Typography>
        </Box>
      </Box>

      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the email used for registration"
              required
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<Search />}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
        </form>
      </Paper>

      {/* Registration Details */}
      {registration && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Hotel sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {registration.hotelName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registration ID: {registration.id}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(registration.status)}
                <Chip 
                  label={registration.status.replace('_', ' ').toUpperCase()} 
                  color={getStatusColor(registration.status)}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Person
              </Typography>
              <Typography variant="body1">
                {registration.contactPerson}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Email
              </Typography>
              <Typography variant="body1">
                {registration.contactEmail}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Submitted
              </Typography>
              <Typography variant="body1">
                {formatDate(registration.submittedAt)}
              </Typography>
            </Box>

            {registration.reviewedAt && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reviewed
                </Typography>
                <Typography variant="body1">
                  {formatDate(registration.reviewedAt)}
                </Typography>
              </Box>
            )}

            {registration.reviewComments && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Comments
                </Typography>
                <Typography variant="body1">
                  {registration.reviewComments}
                </Typography>
              </Box>
            )}

            {/* Status-specific information */}
            {registration.status.toLowerCase() === 'pending' && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Your registration is under review.</strong><br />
                  Our team typically reviews applications within 2-3 business days. 
                  You'll receive an email notification once the review is complete.
                </Typography>
              </Alert>
            )}

            {registration.status.toLowerCase() === 'approved' && (
              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Congratulations! Your hotel registration has been approved.</strong><br />
                  You should have received login credentials via email. If you haven't received them, 
                  please contact our support team.
                </Typography>
              </Alert>
            )}

            {registration.status.toLowerCase() === 'rejected' && (
              <Alert severity="error" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Your registration was not approved.</strong><br />
                  Please review the comments above and feel free to submit a new registration 
                  with the requested changes.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Need Help?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            If you can't find your registration or have questions about the process:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Make sure you're using the exact email address from your registration
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Check your spam/junk folder for notification emails
          </Typography>
          <Typography variant="body2">
            • Contact our support team at support@bookmyhotel.com
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HotelRegistrationStatus;
