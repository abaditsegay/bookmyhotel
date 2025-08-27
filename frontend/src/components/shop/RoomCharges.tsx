import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RoomCharges: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/shop?tab=room-charges')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Room Charges
          </Typography>
        </Box>
      </Box>

      {/* Coming Soon Content */}
      <Card>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            py: 8 
          }}>
            <Typography variant="h4" gutterBottom color="text.secondary">
              Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
              We're working on implementing the Room Charges feature. This will allow you to 
              manage and track charges that are billed directly to guest rooms, including 
              shop purchases, services, and other incidentals.
            </Typography>
            
            <Alert severity="info" sx={{ mt: 2, maxWidth: 600 }}>
              <Typography variant="body2">
                <strong>Upcoming Features:</strong><br />
                • Direct room billing for shop orders<br />
                • Service charge management<br />
                • Integration with guest checkout<br />
                • Detailed room charge reports
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RoomCharges;
