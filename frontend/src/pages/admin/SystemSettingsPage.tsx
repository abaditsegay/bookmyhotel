import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { API_CONFIG, PAYMENT_CONFIG } from '../../config/apiConfig';
import { COLORS, addAlpha } from '../../theme/themeColors';

type GatewayMode = 'mock' | 'real';

interface PaymentGatewaySettingsResponse {
  gatewayMode: GatewayMode;
  source: string;
  updatedAt?: string;
  updatedBy?: string;
}

const SystemSettingsPage: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<PaymentGatewaySettingsResponse | null>(null);
  const [selectedMode, setSelectedMode] = useState<GatewayMode>('mock');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasPendingChanges = useMemo(() => {
    return Boolean(settings && selectedMode !== settings.gatewayMode);
  }, [selectedMode, settings]);

  const fetchSettings = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/system-settings/payment-gateway`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load payment gateway settings');
      }

      const data: PaymentGatewaySettingsResponse = await response.json();
      const normalizedMode = data.gatewayMode === 'real' ? 'real' : 'mock';
      setSettings({ ...data, gatewayMode: normalizedMode });
      setSelectedMode(normalizedMode);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load payment gateway settings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!token) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/system-settings/payment-gateway`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gatewayMode: selectedMode }),
      });

      if (!response.ok) {
        throw new Error('Failed to save payment gateway settings');
      }

      const data: PaymentGatewaySettingsResponse = await response.json();
      setSettings(data);
      setSelectedMode(data.gatewayMode);
      setSuccess(`Payment gateway mode updated to ${data.gatewayMode.toUpperCase()}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save payment gateway settings');
    } finally {
      setSaving(false);
    }
  };

  const formatTimestamp = (value?: string) => {
    if (!value) {
      return 'Not yet updated';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.PRIMARY, mb: 1 }}>
            System Settings
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 760 }}>
            Manage environment-wide booking gateway behavior. This controls whether public booking checkout uses the mock payment processor or the live Ethiopian wallet integrations.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Card elevation={0} sx={{ border: `1px solid ${addAlpha(COLORS.PRIMARY, 0.12)}` }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <PaymentsIcon sx={{ color: COLORS.PRIMARY }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Booking Payment Gateway
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 720 }}>
                      Mock mode keeps checkout in a safe demo path. Real mode enables live M-birr and Telebirr initiation from public bookings.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Chip label={`Current: ${selectedMode.toUpperCase()}`} color={selectedMode === 'real' ? 'success' : 'warning'} />
                    <Chip label={`Default fallback: ${PAYMENT_CONFIG.GATEWAY_MODE.toUpperCase()}`} variant="outlined" />
                  </Stack>
                </Stack>

                <Divider />

                <FormControl>
                  <FormLabel sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                    Gateway Mode
                  </FormLabel>
                  <RadioGroup value={selectedMode} onChange={(event) => setSelectedMode(event.target.value as GatewayMode)}>
                    <FormControlLabel
                      value="mock"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Mock
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Public bookings complete through the mock payment processor. Safe for demos, QA, and environments without live wallet credentials.
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="real"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Real
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Public bookings initiate live M-birr and Telebirr payments. Only enable this when the environment has valid production or sandbox credentials configured.
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                <Alert severity={selectedMode === 'real' ? 'warning' : 'info'} icon={<SettingsIcon fontSize="inherit" />}>
                  {selectedMode === 'real'
                    ? 'Switching to REAL affects all public booking sessions after they reload. The backend will start accepting live Ethiopian wallet initiation.'
                    : 'Switching to MOCK keeps public checkout safe and prevents live Ethiopian wallet initiation from the backend.'}
                </Alert>

                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: addAlpha(COLORS.PRIMARY, 0.04) }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Effective source
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Source: {settings?.source || 'unknown'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Last updated: {formatTimestamp(settings?.updatedAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Updated by: {settings?.updatedBy || 'Application default'}
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchSettings}
                    disabled={loading || saving}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress color="inherit" size={16} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || loading || !hasPendingChanges}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default SystemSettingsPage;