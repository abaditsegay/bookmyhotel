import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  PhotoLibrary as PhotoIcon,
  ExpandMore as ExpandMoreIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { hotelAdminApi, HotelImageUploadRequest, HotelImageResponse } from '../../services/hotelAdminApi';
import { ROOM_TYPE_VALUES } from '../../constants/roomTypes';

interface RoomTypeImageState {
  roomType: string;
  heroImage?: File;
  heroAltText: string;
  existingImages: HotelImageResponse[];
  uploading: boolean;
}

interface HotelGeneralImageState {
  heroImage?: File;
  heroAltText: string;
  existingImages: HotelImageResponse[];
  uploading: boolean;
}

const HotelImageManagement: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<HotelImageResponse | null>(null);

  // Initialize state for each room type
  const [roomTypeStates, setRoomTypeStates] = useState<Record<string, RoomTypeImageState>>(() => {
    const initialStates: Record<string, RoomTypeImageState> = {};
    ROOM_TYPE_VALUES.forEach(roomType => {
      initialStates[roomType] = {
        roomType,
        heroImage: undefined,
        heroAltText: '',
        existingImages: [],
        uploading: false,
      };
    });
    return initialStates;
  });

  // State for hotel general images
  const [hotelGeneralState, setHotelGeneralState] = useState<HotelGeneralImageState>({
    heroImage: undefined,
    heroAltText: '',
    existingImages: [],
    uploading: false,
  });

  // Load existing images for all room types and hotel general
  const loadAllImages = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Load hotel general images
      const hotelGeneralResponse = await hotelAdminApi.getHotelImages(token); // No room type = hotel general
      if (hotelGeneralResponse.success && hotelGeneralResponse.data) {
        setHotelGeneralState(prev => ({
          ...prev,
          existingImages: hotelGeneralResponse.data || [],
        }));
      }

      // Load images for each room type
      for (const roomType of ROOM_TYPE_VALUES) {
        const response = await hotelAdminApi.getHotelImages(token, roomType);
        if (response.success && response.data) {
          setRoomTypeStates(prev => ({
            ...prev,
            [roomType]: {
              ...prev[roomType],
              existingImages: response.data || [],
            }
          }));
        }
      }
      setError(null);
    } catch (err) {
      setError('Failed to load existing images');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAllImages();
  }, [loadAllImages]);

  const updateRoomTypeState = (roomType: string, updates: Partial<RoomTypeImageState>) => {
    setRoomTypeStates(prev => ({
      ...prev,
      [roomType]: {
        ...prev[roomType],
        ...updates,
      }
    }));
  };

  const handleHeroImageChange = (roomType: string, file: File | null) => {
    updateRoomTypeState(roomType, { heroImage: file || undefined });
  };



  const handleUploadImages = async (roomType: string) => {
    if (!token) return;
    
    const state = roomTypeStates[roomType];
    if (!state.heroImage) {
      setError('Please select an image to upload');
      return;
    }

    updateRoomTypeState(roomType, { uploading: true });
    setError(null);
    setSuccess(null);

    try {
      const uploadData: HotelImageUploadRequest = {
        roomType,
        heroImage: state.heroImage,
        heroAltText: state.heroAltText || undefined,
      };

      const response = await hotelAdminApi.uploadHotelImages(token, uploadData);
      
      if (response.success) {
        // Reset the form for this room type
        updateRoomTypeState(roomType, {
          heroImage: undefined,
          heroAltText: '',
          uploading: false,
        });
        
        // Reload images for this room type
        const imagesResponse = await hotelAdminApi.getHotelImages(token, roomType);
        if (imagesResponse.success) {
          updateRoomTypeState(roomType, {
            existingImages: imagesResponse.data || [],
          });
        }
        
        setSuccess(`Successfully uploaded image for ${roomType} rooms!`);
      } else {
        setError(response.message || 'Failed to upload image');
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      updateRoomTypeState(roomType, { uploading: false });
    }
  };

  const handleUploadHotelGeneralImage = async () => {
    if (!token) return;
    
    if (!hotelGeneralState.heroImage) {
      setError('Please select a hotel image to upload');
      return;
    }

    setHotelGeneralState(prev => ({ ...prev, uploading: true }));
    setError(null);
    setSuccess(null);

    try {
      const uploadData: HotelImageUploadRequest = {
        heroImage: hotelGeneralState.heroImage,
        heroAltText: hotelGeneralState.heroAltText || undefined,
        isHotelGeneral: true,
      };

      const response = await hotelAdminApi.uploadHotelImages(token, uploadData);
      
      if (response.success) {
        // Reset the form
        setHotelGeneralState({
          heroImage: undefined,
          heroAltText: '',
          existingImages: [],
          uploading: false,
        });
        
        // Reload hotel general images
        const imagesResponse = await hotelAdminApi.getHotelImages(token); // No room type = hotel general
        if (imagesResponse.success) {
          setHotelGeneralState(prev => ({
            ...prev,
            existingImages: imagesResponse.data || [],
          }));
        }
        
        setSuccess('Successfully uploaded hotel image!');
      } else {
        setError(response.message || 'Failed to upload hotel image');
      }
    } catch (err) {
      setError('Failed to upload hotel image');
    } finally {
      setHotelGeneralState(prev => ({ ...prev, uploading: false }));
    }
  };

  const handleDeleteImage = async () => {
    if (!token || !imageToDelete) return;
    
    try {
      const response = await hotelAdminApi.deleteHotelImage(token, imageToDelete.id);
      if (response.success) {
        setSuccess('Image deleted successfully!');
        // Reload images for the affected room type
        if (imageToDelete.roomTypeName) {
          const imagesResponse = await hotelAdminApi.getHotelImages(token, imageToDelete.roomTypeName);
          if (imagesResponse.success) {
            updateRoomTypeState(imageToDelete.roomTypeName, {
              existingImages: imagesResponse.data || [],
            });
          }
        }
      } else {
        setError(response.message || 'Failed to delete image');
      }
    } catch (err) {
      setError('Failed to delete image');
    } finally {
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  const confirmDeleteImage = (image: HotelImageResponse) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        <PhotoIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Hotel Image Management
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload and manage images for each room type. Images will be automatically organized and optimized for display across your hotel booking system.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Hotel General Images Section */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Hotel General Images
            </Typography>
            <Chip 
              label={`${hotelGeneralState.existingImages.length} images`} 
              size="small" 
              color={hotelGeneralState.existingImages.length > 0 ? 'primary' : 'default'}
              sx={{ mr: 1 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Upload Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upload Hotel Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload general hotel images (lobby, exterior, amenities, etc.)
                  </Typography>

                  {/* Hotel Image Upload */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Hotel Image
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setHotelGeneralState(prev => ({ ...prev, heroImage: file || undefined }));
                      }}
                      style={{ marginBottom: '8px', display: 'block' }}
                    />
                    {hotelGeneralState.heroImage && (
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <img
                          src={URL.createObjectURL(hotelGeneralState.heroImage)}
                          alt="Hotel preview"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '150px', 
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      </Box>
                    )}
                    <TextField
                      fullWidth
                      label="Hotel Image Alt Text"
                      value={hotelGeneralState.heroAltText}
                      onChange={(e) => setHotelGeneralState(prev => ({ ...prev, heroAltText: e.target.value }))}
                      helperText="Describe the hotel image for accessibility"
                      size="small"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    startIcon={hotelGeneralState.uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    onClick={handleUploadHotelGeneralImage}
                    disabled={hotelGeneralState.uploading || !hotelGeneralState.heroImage}
                    fullWidth
                  >
                    {hotelGeneralState.uploading ? 'Uploading...' : 'Upload Hotel Image'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Existing Hotel Images Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Current Hotel Images ({hotelGeneralState.existingImages.length})
                  </Typography>

                  {hotelGeneralState.existingImages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        No hotel images uploaded yet
                      </Typography>
                    </Box>
                  ) : (
                    <ImageList cols={2} gap={8}>
                      {hotelGeneralState.existingImages.map((image) => (
                        <ImageListItem key={image.id}>
                          <img
                            src={image.s3Url}
                            alt={image.altText || image.fileName}
                            loading="lazy"
                            style={{ 
                              height: '120px', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                          <ImageListItemBar
                            title="Hotel Image"
                            subtitle={image.altText || 'No alt text'}
                            actionIcon={
                              <IconButton
                                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                onClick={() => confirmDeleteImage(image)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {ROOM_TYPE_VALUES.map((roomType) => {
        const state = roomTypeStates[roomType];
        return (
          <Accordion key={roomType} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {roomType} Rooms
                </Typography>
                <Chip 
                  label={`${state.existingImages.length} images`} 
                  size="small" 
                  color={state.existingImages.length > 0 ? 'primary' : 'default'}
                  sx={{ mr: 1 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Upload Section */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Upload Room Image
                      </Typography>

                      {/* Room Image Upload */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          {roomType} Room Image
                        </Typography>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroImageChange(roomType, e.target.files?.[0] || null)}
                          style={{ marginBottom: '8px', display: 'block' }}
                        />
                        {state.heroImage && (
                          <Box sx={{ mt: 1, mb: 1 }}>
                            <img
                              src={URL.createObjectURL(state.heroImage)}
                              alt="Hero preview"
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '150px', 
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                            />
                          </Box>
                        )}
                        <TextField
                          fullWidth
                          label="Room Image Alt Text"
                          value={state.heroAltText}
                          onChange={(e) => updateRoomTypeState(roomType, { heroAltText: e.target.value })}
                          helperText="Describe the room image for accessibility"
                          size="small"
                        />
                      </Box>


                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        startIcon={state.uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                        onClick={() => handleUploadImages(roomType)}
                        disabled={state.uploading || !state.heroImage}
                        fullWidth
                      >
                        {state.uploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* Existing Images Section */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Current {roomType} Images ({state.existingImages.length})
                      </Typography>

                      {state.existingImages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            No {roomType.toLowerCase()} room images uploaded yet
                          </Typography>
                        </Box>
                      ) : (
                        <ImageList cols={2} gap={8}>
                          {state.existingImages.map((image) => (
                            <ImageListItem key={image.id}>
                              <img
                                src={image.s3Url}
                                alt={image.altText || image.fileName}
                                loading="lazy"
                                style={{ 
                                  height: '120px', 
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                              />
                              <ImageListItemBar
                                title={image.imageCategory}
                                subtitle={image.altText || 'No alt text'}
                                actionIcon={
                                  <IconButton
                                    sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                    onClick={() => confirmDeleteImage(image)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                }
                              />
                            </ImageListItem>
                          ))}
                        </ImageList>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this image? This action cannot be undone.
          </Typography>
          {imageToDelete && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img
                src={imageToDelete.s3Url}
                alt={imageToDelete.altText || 'Image to delete'}
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '150px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteImage} color="error" variant="contained">
            Delete Image
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelImageManagement;