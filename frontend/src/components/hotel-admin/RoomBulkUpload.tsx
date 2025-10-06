import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { hotelAdminApi } from '../../services/hotelAdminApi';
import { useAuth } from '../../contexts/AuthContext';

interface RoomData {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
  status?: string;
  isAvailable?: boolean;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

interface RoomBulkUploadProps {
  onUploadComplete?: (rooms: RoomData[]) => void;
  onClose?: () => void;
  hotelId?: string;
}

const RoomBulkUpload: React.FC<RoomBulkUploadProps> = ({ onUploadComplete, onClose, hotelId }) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<RoomData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [successOverlayOpen, setSuccessOverlayOpen] = useState(false);
  const [importStats, setImportStats] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  }>({ successful: 0, failed: 0, errors: [] });

  const steps = [
    'Download Template',
    'Prepare Your Data',
    'Upload CSV File',
    'Review & Validate',
    'Import Rooms'
  ];

  const requiredFields = ['roomNumber', 'roomType', 'pricePerNight', 'capacity'];

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/hotel-rooms-template.csv';
    link.download = 'hotel-rooms-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveStep(Math.max(activeStep, 1));
  };

  const downloadGuide = () => {
    const link = document.createElement('a');
    link.href = '/templates/room-upload-guide.md';
    link.download = 'room-upload-guide.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (csvText: string): RoomData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      console.log('CSV parsing: Not enough lines');
      return [];
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    console.log('CSV headers found:', headers);
    
    const rooms: RoomData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const room: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        const headerKey = header.toLowerCase();
        
        switch (headerKey) {
        case 'room number':
        case 'roomnumber':
        case 'room_number':
          room.roomNumber = value;
          break;
        case 'room type':
        case 'roomtype':
        case 'room_type':
        case 'type':
          room.roomType = value;
          break;
        case 'price per night':
        case 'pricepernight':
        case 'price_per_night':
        case 'price':
        case 'base price':
        case 'baseprice':
        case 'base_price':
          room.pricePerNight = parseFloat(value) || 0;
          break;
        case 'capacity':
        case 'guest_capacity':
        case 'guests':
          room.capacity = parseInt(value) || 0;
          break;
        case 'description':
          room.description = value;
          break;
        case 'status':
          room.status = value;
          break;
        case 'is available':
        case 'isavailable':
        case 'is_available':
        case 'available':
          room.isAvailable = value.toLowerCase() === 'true';
          break;
        }
      });
      
      // Only add rooms that have at least a room number
      if (room.roomNumber && room.roomNumber.trim() !== '') {
        rooms.push(room);
      }
    }
    
    console.log('CSV parsing complete:', rooms.length, 'rooms found');
    return rooms;
  };

  const validateData = (rooms: RoomData[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const roomNumbers = new Set();
    
    rooms.forEach((room, index) => {
      const rowNumber = index + 2; // +2 because CSV row 1 is headers, array is 0-indexed
      
      // Check required fields
      requiredFields.forEach(field => {
        if (!room[field as keyof RoomData] || room[field as keyof RoomData] === '') {
          errors.push({
            row: rowNumber,
            field,
            message: `${field} is required`,
            value: room[field as keyof RoomData]
          });
        }
      });
      
      // Check for duplicate room numbers
      if (room.roomNumber) {
        if (roomNumbers.has(room.roomNumber)) {
          errors.push({
            row: rowNumber,
            field: 'roomNumber',
            message: 'Room number must be unique',
            value: room.roomNumber
          });
        } else {
          roomNumbers.add(room.roomNumber);
        }
      }
      
      // Validate capacity
      if (room.capacity && (room.capacity < 1 || room.capacity > 20)) {
        errors.push({
          row: rowNumber,
          field: 'capacity',
          message: 'Capacity must be between 1 and 20',
          value: room.capacity
        });
      }
      
      // Validate price per night
      if (room.pricePerNight && room.pricePerNight <= 0) {
        errors.push({
          row: rowNumber,
          field: 'pricePerNight',
          message: 'Price per night must be greater than 0',
          value: room.pricePerNight
        });
      }
      
      // Validate status
      const validStatuses = ['Available', 'Occupied', 'Maintenance', 'Out of Order'];
      if (room.status && !validStatuses.includes(room.status)) {
        errors.push({
          row: rowNumber,
          field: 'status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          value: room.status
        });
      }
    });
    
    return errors;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }
    
    setUploadedFile(file);
    setIsProcessing(true);
    setActiveStep(Math.max(activeStep, 2));
    
    try {
      // First try server-side validation if token is available
      if (token) {
        console.log('Attempting server-side validation...');
        const validationResult = await hotelAdminApi.validateCsv(token, file, hotelId?.toString());
        console.log('Server validation result:', validationResult);
        if (validationResult.success && validationResult.data) {
          // Handle nested data structure
          const actualData = validationResult.data.data || validationResult.data;
          setParsedData(actualData.successfulRooms || []);
          setValidationErrors(actualData.validationErrors || []);
          console.log('Parsed data set:', actualData.successfulRooms?.length || 0, 'rooms');
          // Always go to step 3 (Review & Validate) to show the data table
          setActiveStep(Math.max(activeStep, 3));
          setIsProcessing(false);
          return;
        }
      }
      
      // Fallback to client-side parsing and validation
      console.log('Using client-side parsing...');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          console.log('CSV text loaded, length:', csvText?.length);
          const rooms = parseCSV(csvText);
          const errors = validateData(rooms);
          console.log('Client-side parsed:', rooms?.length, 'rooms, errors:', errors?.length);
          
          setParsedData(rooms);
          setValidationErrors(errors);
          // Always go to step 3 (Review & Validate) to show the data table
          setActiveStep(Math.max(activeStep, 3));
          setIsProcessing(false);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the format.');
          setIsProcessing(false);
        }
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      console.error('Error validating file:', error);
      alert('Error validating file. Using offline validation.');
      
      // Fallback to client-side validation
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const rooms = parseCSV(csvText);
          const errors = validateData(rooms);
          
          setParsedData(rooms);
          setValidationErrors(errors);
          // Always go to step 3 (Review & Validate) to show the data table
          setActiveStep(Math.max(activeStep, 3));
          setIsProcessing(false);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the format.');
          setIsProcessing(false);
        }
      };
      
      reader.readAsText(file);
    }
  };

  const handleImportRooms = async () => {
    if (validationErrors.length > 0) {
      setErrorDialogOpen(true);
      return;
    }
    
    if (!uploadedFile || !token) {
      console.error('Missing file or token');
      return;
    }
    
    setIsImporting(true);
    
    try {
      const result = await hotelAdminApi.bulkUploadRooms(token, uploadedFile, false, hotelId?.toString());
      
      if (result.success) {
        // The backend wraps the response in { success: true, data: { successfulImports, ... } }
        // So we need to access result.data.data to get the actual import statistics
        const responseData = result.data?.data || result.data || {};
        
        const successfulImports = responseData.successfulImports || 0;
        const failedImports = responseData.failedImports || 0;
        const importErrors = responseData.importErrors || [];
        
        // Store stats for success overlay
        setImportStats({
          successful: successfulImports,
          failed: failedImports,
          errors: importErrors
        });
        
        if (onUploadComplete && responseData.importedRooms) {
          onUploadComplete(responseData.importedRooms);
        }
        
        setActiveStep(5);
        
        // Show success overlay
        setSuccessOverlayOpen(true);
        
        console.log(`Import completed: ${successfulImports} rooms imported` + 
          (failedImports > 0 ? `, ${failedImports} failed` : ''));
        
        if (importErrors.length > 0) {
          console.log('Import errors:', importErrors);
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Error uploading rooms:', error);
      alert('Error uploading rooms: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsImporting(false);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setIsImporting(false);
    setActiveStep(0);
    setSuccessOverlayOpen(false);
    setImportStats({ successful: 0, failed: 0, errors: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, position: 'relative' }}>
      {/* Full Dialog Spinner Overlay */}
      {isImporting && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: 1
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <LinearProgress sx={{ width: 300, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Importing Rooms...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creating {parsedData.length} rooms in the system
            </Typography>
          </Box>
        </Box>
      )}
      
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🏨 Bulk Room Upload
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Upload multiple rooms at once using our CSV template. This makes hotel onboarding quick and easy.
      </Typography>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {index === 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Download our CSV template with sample room data to get started, or skip if you already have a template.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={downloadTemplate}
                      >
                        Download CSV Template
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<InfoIcon />}
                        onClick={downloadGuide}
                      >
                        Download Guide
                      </Button>
                    </Box>
                    <Button
                      variant="text"
                      onClick={() => setActiveStep(Math.max(activeStep, 1))}
                      sx={{ mt: 1 }}
                    >
                      Skip - I already have a template
                    </Button>
                  </Box>
                )}
                
                {index === 1 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Fill in your room data using the downloaded template. Open the CSV file in Excel or any spreadsheet application and:
                    </Typography>
                    <Box sx={{ mb: 2, pl: 2 }}>
                      <Typography variant="body2" component="div">
                        • Replace the sample data with your actual room information
                      </Typography>
                      <Typography variant="body2" component="div">
                        • Ensure all required fields are filled in
                      </Typography>
                      <Typography variant="body2" component="div">
                        • Save the file as CSV format when done
                      </Typography>
                    </Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Required fields: Room Number, Room Type, Price Per Night, Capacity
                    </Alert>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(Math.max(activeStep, 2))}
                      sx={{ mt: 1 }}
                    >
                      Continue to Upload
                    </Button>
                  </Box>
                )}
                
                {index === 2 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Select your completed CSV file to upload.
                    </Typography>
                    <input
                      type="file"
                      accept=".csv"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                    />
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                    >
                      Select CSV File
                    </Button>
                    {uploadedFile && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                        ✅ File selected: {uploadedFile.name}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {index === 3 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Review your data and fix any validation errors.
                    </Typography>
                    
                    {parsedData.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Chip 
                          icon={<SuccessIcon />} 
                          label={`${parsedData.length} rooms found`} 
                          color="success" 
                        />
                        {validationErrors.length > 0 ? (
                          <Chip 
                            icon={<ErrorIcon />} 
                            label={`${validationErrors.length} errors`} 
                            color="error" 
                          />
                        ) : (
                          <Chip 
                            icon={<SuccessIcon />} 
                            label="No errors" 
                            color="success" 
                          />
                        )}
                        <Button
                          size="small"
                          startIcon={<PreviewIcon />}
                          onClick={() => setPreviewDialogOpen(true)}
                        >
                          Full Preview
                        </Button>
                      </Box>
                    )}
                    
                    {/* Always show room data if any rooms were parsed */}
                    {parsedData.length > 0 && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Room Data Preview
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 300, mb: 2 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Room Number</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Price/Night</TableCell>
                                <TableCell>Capacity</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Description</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {parsedData.slice(0, 10).map((room, index) => (
                                <TableRow key={index}>
                                  <TableCell>{room.roomNumber}</TableCell>
                                  <TableCell>{room.roomType}</TableCell>
                                  <TableCell>${room.pricePerNight}</TableCell>
                                  <TableCell>{room.capacity}</TableCell>
                                  <TableCell>{room.status || 'Available'}</TableCell>
                                  <TableCell>{room.description || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        {parsedData.length > 10 && (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                            Showing first 10 rooms. Click "Full Preview" to see all {parsedData.length} rooms.
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="h6" color="error" sx={{ mb: 1 }}>
                          Validation Errors
                        </Typography>
                        <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Row</TableCell>
                                <TableCell>Field</TableCell>
                                <TableCell>Error</TableCell>
                                <TableCell>Value</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {validationErrors.map((error, index) => (
                                <TableRow key={index}>
                                  <TableCell>{error.row}</TableCell>
                                  <TableCell>{error.field}</TableCell>
                                  <TableCell>{error.message}</TableCell>
                                  <TableCell>{error.value}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                    
                    {validationErrors.length === 0 && parsedData.length > 0 && (
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(Math.max(activeStep, 4))}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Continue to Import
                      </Button>
                    )}
                    
                    {validationErrors.length > 0 && parsedData.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          There are {validationErrors.length} validation errors. You can review them below and fix your CSV file, or continue anyway if you want to skip invalid rows.
                        </Alert>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => setActiveStep(Math.max(activeStep, 4))}
                          >
                            Continue Anyway (Skip Invalid Rows)
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              // Reset to step 2 to re-upload corrected file
                              setActiveStep(2);
                              setUploadedFile(null);
                              setParsedData([]);
                              setValidationErrors([]);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                          >
                            Upload Corrected File
                          </Button>
                        </Box>
                      </Box>
                    )}
                    
                    {parsedData.length === 0 && !isProcessing && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        No valid room data found. Please check your CSV file format and try again.
                      </Alert>
                    )}
                  </Box>
                )}
                
                {index === 4 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Import the validated rooms into your hotel system.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleImportRooms}
                      disabled={isImporting || validationErrors.length > 0}
                      startIcon={<UploadIcon />}
                      size="large"
                    >
                      Import {parsedData.length} Rooms
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Reset Button */}
      {(uploadedFile || parsedData.length > 0) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={resetUpload}
          >
            Start Over
          </Button>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Room Data Preview</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Room #</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Available</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedData.slice(0, 50).map((room, index) => (
                  <TableRow key={index}>
                    <TableCell>{room.roomNumber}</TableCell>
                    <TableCell>{room.roomType}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>${room.pricePerNight}</TableCell>
                    <TableCell>{room.status || 'AVAILABLE'}</TableCell>
                    <TableCell>{room.isAvailable ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {parsedData.length > 50 && (
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
              Showing first 50 rooms. Total: {parsedData.length} rooms
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Validation Errors Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorIcon color="error" />
            Validation Errors ({validationErrors.length})
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please fix these errors before importing rooms.
          </Alert>
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Error</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validationErrors.map((error, index) => (
                  <TableRow key={index}>
                    <TableCell>{error.row}</TableCell>
                    <TableCell>{error.field}</TableCell>
                    <TableCell>{error.message}</TableCell>
                    <TableCell>{String(error.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Success Overlay */}
      <Dialog
        open={successOverlayOpen}
        onClose={() => setSuccessOverlayOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            textAlign: 'center',
            animation: 'slideIn 0.5s ease-out',
            '@keyframes slideIn': {
              '0%': {
                transform: 'scale(0.8) translateY(-50px)',
                opacity: 0,
              },
              '100%': {
                transform: 'scale(1) translateY(0)',
                opacity: 1,
              },
            },
          }
        }}
      >
        <DialogContent sx={{ py: 4, px: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {/* Success Icon with Animation */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'bounce 0.6s ease-in-out 0.3s both',
                '@keyframes bounce': {
                  '0%, 20%, 50%, 80%, 100%': {
                    transform: 'translateY(0)',
                  },
                  '40%': {
                    transform: 'translateY(-10px)',
                  },
                  '60%': {
                    transform: 'translateY(-5px)',
                  },
                },
              }}
            >
              <SuccessIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>

            {/* Success Message */}
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              🎉 Import Successful!
            </Typography>

            {/* Import Statistics */}
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Import Summary
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {importStats.successful}
                  </Typography>
                  <Typography variant="body2">
                    Rooms Created
                  </Typography>
                </Box>
                
                {importStats.failed > 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {importStats.failed}
                    </Typography>
                    <Typography variant="body2">
                      Skipped
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Progress Bar Animation */}
              <Box sx={{ position: 'relative', mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                      borderRadius: 4,
                      animation: 'progressFill 1s ease-out 0.5s both',
                      '@keyframes progressFill': {
                        '0%': {
                          transform: 'scaleX(0)',
                        },
                        '100%': {
                          transform: 'scaleX(1)',
                        },
                      },
                    },
                  }}
                />
              </Box>

              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Your rooms have been successfully imported and are now available for booking!
              </Typography>

              {/* Show errors if any */}
              {importStats.errors.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Import Warnings:
                  </Typography>
                  {importStats.errors.slice(0, 3).map((error, index) => (
                    <Typography key={index} variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                      • {error}
                    </Typography>
                  ))}
                  {importStats.errors.length > 3 && (
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      ... and {importStats.errors.length - 3} more
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setSuccessOverlayOpen(false);
              if (onClose) {
                onClose();
              }
            }}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
            }}
          >
            Close & Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomBulkUpload;