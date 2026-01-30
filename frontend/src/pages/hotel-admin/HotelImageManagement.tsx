import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
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
  ExpandMore as ExpandMoreIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { hotelAdminApi, HotelImageUploadRequest, HotelImageResponse } from '../../services/hotelAdminApi';
import { ROOM_TYPE_VALUES } from '../../constants/roomTypes';

interface RoomTypeImageState {
  roomType: string;
  heroImage?: File;
  existingImages: HotelImageResponse[];
  uploading: boolean;
}

interface HotelGeneralImageState {
  heroImage?: File;
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
        existingImages: [],
        uploading: false,
      };
    });
    return initialStates;
  });

  // State for hotel general images
  const [hotelGeneralState, setHotelGeneralState] = useState<HotelGeneralImageState>({
    heroImage: undefined,
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
        // Ensure data is an array
        const images = Array.isArray(hotelGeneralResponse.data) ? hotelGeneralResponse.data : [];
        setHotelGeneralState(prev => ({
          ...prev,
          existingImages: images,
        }));
      }

      // Load images for each room type
      for (const roomType of ROOM_TYPE_VALUES) {
        const response = await hotelAdminApi.getHotelImages(token, roomType);
        if (response.success && response.data) {
          // Ensure data is an array
          const images = Array.isArray(response.data) ? response.data : [];
          setRoomTypeStates(prev => ({
            ...prev,
            [roomType]: {
              ...prev[roomType],
              existingImages: images,
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
        heroAltText: `${roomType} Room Image`,
      };

      const response = await hotelAdminApi.uploadHotelImages(token, uploadData);
      
      if (response.success) {
        // Reset the form for this room type
        updateRoomTypeState(roomType, {
          heroImage: undefined,
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
        heroAltText: "Hotel Main Image",
        isHotelGeneral: true,
      };

      const response = await hotelAdminApi.uploadHotelImages(token, uploadData);
      
      if (response.success) {
        // Reset the form but keep existing images until they're reloaded
        setHotelGeneralState(prev => ({
          ...prev,
          heroImage: undefined,
          uploading: false,
        }));
        
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
        // Reload images for the affected room type or hotel general
        if (imageToDelete.roomTypeName) {
          const imagesResponse = await hotelAdminApi.getHotelImages(token, imageToDelete.roomTypeName);
          if (imagesResponse.success) {
            updateRoomTypeState(imageToDelete.roomTypeName, {
              existingImages: imagesResponse.data || [],
            });
          }
        } else {
          // This is a hotel general image
          const imagesResponse = await hotelAdminApi.getHotelImages(token); // No room type = hotel general
          if (imagesResponse.success) {
            setHotelGeneralState(prev => ({
              ...prev,
              existingImages: imagesResponse.data || [],
            }));
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
    <Box>
      {/* Professional Page Header */}
      <Box 
        sx={{ 
          mb: 4,
          pb: 3,
          borderBottom: 2,
          borderColor: 'primary.main',
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            mb: 1,
          }}
        >
          Hotel Image Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
        >
          Upload and manage images for your hotel and different room types
        </Typography>
      </Box>

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
      <Accordion 
        sx={{ 
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          '&:before': { display: 'none' },
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '8px 8px 0 0',
            '& .MuiAccordionSummary-expandIconWrapper': {
              color: 'white',
            },
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Hotel Main Image
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={3}>
            {/* Upload Section */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  border: '2px dashed',
                  borderColor: 'primary.light',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                    Upload New Image
                  </Typography>
                  
                  {/* Hotel Image Upload */}
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<UploadIcon />}
                      sx={{ 
                        py: 1.5,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                      }}
                    >
                      Choose Hotel Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setHotelGeneralState(prev => ({ ...prev, heroImage: file || undefined }));
                        }}
                      />
                    </Button>
                    
                    {hotelGeneralState.heroImage && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Preview:
                        </Typography>
                        <Box
                          sx={{
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <img
                            src={URL.createObjectURL(hotelGeneralState.heroImage)}
                            alt="Hotel preview"
                            style={{ 
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              p: 1,
                            }}
                          >
                            <Typography variant="caption" noWrap>
                              {hotelGeneralState.heroImage.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={hotelGeneralState.uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                    onClick={handleUploadHotelGeneralImage}
                    disabled={hotelGeneralState.uploading || !hotelGeneralState.heroImage}
                    fullWidth
                    sx={{
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&.Mui-disabled': {
                        color: 'text.disabled',
                        backgroundColor: 'rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    {hotelGeneralState.uploading ? 'Uploading...' : 'Upload Hotel Image'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Existing Hotel Images Section */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                    Current Images
                  </Typography>

                  {!Array.isArray(hotelGeneralState.existingImages) || hotelGeneralState.existingImages.length === 0 ? (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        No images uploaded yet
                      </Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                        Upload your first hotel image to get started
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      <ImageList cols={1} gap={16}>
                        {(hotelGeneralState.existingImages || []).map((image) => (
                          <ImageListItem 
                            key={image.id}
                            sx={{
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <img
                              src={image.s3Url}
                              alt={image.altText || image.fileName}
                              loading="lazy"
                              style={{ 
                                height: '200px', 
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <ImageListItemBar
                              subtitle={image.altText || image.fileName}
                              sx={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                              }}
                              actionIcon={
                                <IconButton
                                  sx={{ 
                                    color: 'white',
                                    '&:hover': {
                                      color: 'error.light',
                                    },
                                  }}
                                  onClick={() => confirmDeleteImage(image)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              }
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
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
          <Accordion 
            key={roomType} 
            sx={{ 
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              '&:before': { display: 'none' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: 'grey.100',
                color: 'text.primary',
                borderRadius: '8px 8px 0 0',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '& .MuiAccordionSummary-expandIconWrapper': {
                  color: 'text.secondary',
                },
                '&:hover': {
                  bgcolor: 'grey.200',
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                {roomType.toLowerCase().replace('_', ' ')} Rooms
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={3}>
                {/* Upload Section */}
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                        Upload New Image
                      </Typography>
                      
                      {/* Room Image Upload */}
                      <Box sx={{ mb: 3 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<UploadIcon />}
                          sx={{ 
                            py: 1.5,
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                          }}
                        >
                          Choose Room Image
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleHeroImageChange(roomType, e.target.files?.[0] || null)}
                          />
                        </Button>
                        
                        {state.heroImage && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Preview:
                            </Typography>
                            <Box
                              sx={{
                                position: 'relative',
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <img
                                src={URL.createObjectURL(state.heroImage)}
                                alt="Room preview"
                                style={{ 
                                  width: '100%',
                                  height: '200px',
                                  objectFit: 'cover',
                                }}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  bgcolor: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  p: 1,
                                }}
                              >
                                <Typography variant="caption" noWrap>
                                  {state.heroImage.name}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Box>


                    </CardContent>
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={state.uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                        onClick={() => handleUploadImages(roomType)}
                        disabled={state.uploading || !state.heroImage}
                        fullWidth
                        sx={{
                          py: 1.5,
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 600,
                          '&.Mui-disabled': {
                            color: 'text.disabled',
                            backgroundColor: 'rgba(0, 0, 0, 0.12)',
                          }
                        }}
                      >
                        {state.uploading ? 'Uploading...' : 'Upload Room Image'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                {/* Existing Images Section */}
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                        Current Images
                      </Typography>

                      {!Array.isArray(state.existingImages) || state.existingImages.length === 0 ? (
                        <Box 
                          sx={{ 
                            textAlign: 'center', 
                            py: 6,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                            No images uploaded yet
                          </Typography>
                          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                            Upload your first room image to get started
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                          <ImageList cols={1} gap={16}>
                            {(state.existingImages || []).map((image) => (
                              <ImageListItem 
                                key={image.id}
                                sx={{
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    transform: 'translateY(-2px)',
                                  },
                                }}
                              >
                                <img
                                  src={image.s3Url}
                                  alt={image.altText || image.fileName}
                                  loading="lazy"
                                  style={{ 
                                    height: '200px', 
                                    objectFit: 'cover',
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                                <ImageListItemBar
                                  subtitle={image.altText || image.fileName}
                                  sx={{
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                  }}
                                  actionIcon={
                                    <IconButton
                                      sx={{ 
                                        color: 'white',
                                        '&:hover': {
                                          color: 'error.light',
                                        },
                                      }}
                                      onClick={() => confirmDeleteImage(image)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  }
                                />
                              </ImageListItem>
                            ))}
                          </ImageList>
                        </Box>
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
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this image? This action cannot be undone.
          </Typography>
          {imageToDelete && (
            <Box 
              sx={{ 
                mt: 3,
                textAlign: 'center',
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
              }}
            >
              <img
                src={imageToDelete.s3Url}
                alt={imageToDelete.altText || 'Image to delete'}
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '250px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {imageToDelete.altText || imageToDelete.fileName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            size="large"
            sx={{ textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteImage} 
            color="error" 
            variant="contained"
            size="large"
            sx={{ textTransform: 'none', px: 3 }}
          >
            Delete Image
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelImageManagement;