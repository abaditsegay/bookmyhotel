import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/globalStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HotelImageGallery = ({ 
  images = [], 
  hotelName = '',
  visible = false,
  initialIndex = 0,
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Default placeholder images if none provided
  const defaultImages = [
    'https://via.placeholder.com/800x600/E0E0E0/9E9E9E?text=Hotel+Image',
    'https://via.placeholder.com/800x600/F5F5F5/9E9E9E?text=Room+View',
    'https://via.placeholder.com/800x600/FAFAFA/9E9E9E?text=Amenities',
  ];

  const galleryImages = images.length > 0 ? images : defaultImages;

  const handleScroll = useCallback((event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(slideIndex);
  }, []);

  const handleImageError = useCallback(() => {
    console.warn('Failed to load hotel image');
  }, []);

  const renderMainImage = ({ item, index }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: item }}
        style={styles.fullImage}
        resizeMode="cover"
        onError={handleImageError}
      />
    </View>
  );

  const renderThumbnail = ({ item, index }) => {
    const isActive = index === currentIndex;
    
    return (
      <TouchableOpacity
        style={[styles.thumbnail, isActive && styles.activeThumbnail]}
        onPress={() => setCurrentIndex(index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item }}
          style={styles.thumbnailImage}
          resizeMode="cover"
          onError={handleImageError}
        />
        {isActive && (
          <View style={styles.activeThumbnailOverlay} />
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.hotelNameText} numberOfLines={1}>
              {hotelName}
            </Text>
            <Text style={styles.imageCountText}>
              {currentIndex + 1} of {galleryImages.length}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Main Image Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={galleryImages}
            renderItem={renderMainImage}
            keyExtractor={(item, index) => `main-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            initialScrollIndex={initialIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
          />

          {/* Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.prevButton]}
                  onPress={() => setCurrentIndex(currentIndex - 1)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={24} color={colors.white} />
                </TouchableOpacity>
              )}
              
              {currentIndex < galleryImages.length - 1 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton]}
                  onPress={() => setCurrentIndex(currentIndex + 1)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-forward" size={24} color={colors.white} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Thumbnail Strip */}
        {galleryImages.length > 1 && (
          <View style={styles.thumbnailContainer}>
            <FlatList
              data={galleryImages}
              renderItem={renderThumbnail}
              keyExtractor={(item, index) => `thumb-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailList}
              style={styles.thumbnailFlatList}
            />
          </View>
        )}

        {/* Page Indicator (Alternative to thumbnails for many images) */}
        {galleryImages.length > 5 && (
          <View style={styles.pageIndicatorContainer}>
            <View style={styles.pageIndicator}>
              {galleryImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && styles.activeDot
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50, // Status bar height
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  hotelNameText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
    textAlign: 'center',
  },
  imageCountText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  carouselContainer: {
    flex: 1,
    position: 'relative',
  },
  imageContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  prevButton: {
    left: spacing.lg,
  },
  nextButton: {
    right: spacing.lg,
  },
  thumbnailContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: spacing.md,
  },
  thumbnailFlatList: {
    maxHeight: 80,
  },
  thumbnailList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  activeThumbnail: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  activeThumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
  },
  pageIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: spacing.xs,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default HotelImageGallery;
