# AWS S3 Image Management System

This document explains the AWS S3 image management system for hotels and room types in the BookMyHotel application.

## Overview

The image management system provides a comprehensive solution for storing, managing, and serving hotel and room type images using AWS S3. It supports:

- **Hotel Images**: Hero images and gallery images for hotels
- **Room Type Images**: Hero images and gallery images for specific room types
- **Multi-tenant Architecture**: Complete tenant isolation for images
- **Image Validation**: File size, format, and dimension validation
- **Image Categories**: Organized storage with proper categorization

## AWS S3 Setup

### 1. Create S3 Bucket

You've already created the `bookmyhotel-images` bucket. Make sure it has the following configuration:

```bash
# Bucket name: bookmyhotel-images
# Region: us-east-1 (or your preferred region)
# Public access: Blocked (images served via signed URLs if needed)
```

### 2. Configure AWS Credentials

Set up your AWS credentials using one of these methods:

#### Environment Variables (Recommended for Development)
```bash
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_S3_REGION=us-east-1
export AWS_S3_BUCKET_NAME=bookmyhotel-images
```

#### AWS Credentials File
```bash
# ~/.aws/credentials
[default]
aws_access_key_id = your_access_key_id
aws_secret_access_key = your_secret_access_key
region = us-east-1
```

#### Application Properties
```properties
aws.s3.bucket.name=bookmyhotel-images
aws.s3.region=us-east-1
aws.s3.access-key-id=your_access_key_id
aws.s3.secret-access-key=your_secret_access_key
```

### 3. IAM Permissions

Ensure your AWS user/role has the following S3 permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::bookmyhotel-images",
                "arn:aws:s3:::bookmyhotel-images/*"
            ]
        }
    ]
}
```

## Database Schema

The system uses a `hotel_images` table with the following structure:

```sql
CREATE TABLE hotel_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    hotel_id BIGINT NOT NULL,
    room_type_id BIGINT DEFAULT NULL,  -- NULL for hotel images
    image_category VARCHAR(50) NOT NULL,  -- hotel_hero, hotel_gallery, room_type_hero, room_type_gallery
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,   -- Full S3 URL
    display_order INT NOT NULL DEFAULT 0,
    alt_text VARCHAR(255) DEFAULT NULL,
    file_size BIGINT DEFAULT NULL,
    mime_type VARCHAR(100) DEFAULT NULL,
    width INT DEFAULT NULL,
    height INT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);
```

## S3 Storage Structure

Images are organized in S3 using a hierarchical structure:

```
bookmyhotel-images/
├── hotels/
│   └── {tenant-id}/
│       └── {hotel-id}/
│           ├── hotel_hero/
│           │   └── {uuid}.jpg
│           ├── hotel_gallery/
│           │   ├── {uuid}.jpg
│           │   └── {uuid}.png
│           └── room-types/
│               └── {room-type-id}/
│                   ├── room_type_hero/
│                   │   └── {uuid}.jpg
│                   └── room_type_gallery/
│                       ├── {uuid}.jpg
│                       └── {uuid}.png
```

### Example Paths:
- Hotel hero image: `hotels/tenant123/45/hotel_hero/abc123.jpg`
- Room type gallery: `hotels/tenant123/45/room-types/2/room_type_gallery/def456.png`

## API Endpoints

### Upload Hotel Image
```http
POST /api/hotels/{hotelId}/images
Content-Type: multipart/form-data

Parameters:
- file: Image file (required)
- category: Image category (hotel_hero or hotel_gallery)
- altText: Alt text for accessibility (optional)
- displayOrder: Display order (optional)
```

### Upload Room Type Image
```http
POST /api/hotels/{hotelId}/images/room-types/{roomTypeId}
Content-Type: multipart/form-data

Parameters:
- file: Image file (required)
- category: Image category (room_type_hero or room_type_gallery)
- altText: Alt text for accessibility (optional)
- displayOrder: Display order (optional)
```

### Get Hotel Images
```http
GET /api/hotels/{hotelId}/images
```

### Get Room Type Images
```http
GET /api/hotels/{hotelId}/images/room-types/{roomTypeId}
```

### Get Hero Images
```http
GET /api/hotels/{hotelId}/images/hero
GET /api/hotels/{hotelId}/images/room-types/{roomTypeId}/hero
```

### Delete Image
```http
DELETE /api/hotels/{hotelId}/images/{imageId}
```

### Update Image Properties
```http
PATCH /api/hotels/{hotelId}/images/{imageId}/display-order?displayOrder={newOrder}
PATCH /api/hotels/{hotelId}/images/{imageId}/alt-text?altText={newAltText}
```

## Image Categories

### Hotel Images
- **hotel_hero**: Main hero image for the hotel (only one allowed)
- **hotel_gallery**: Additional gallery images for the hotel

### Room Type Images
- **room_type_hero**: Main hero image for a room type (only one allowed per room type)
- **room_type_gallery**: Additional gallery images for a room type

## Image Validation

### File Size
- Maximum: 10MB per image
- Configurable via `image.upload.max-file-size`

### Image Dimensions
- Maximum: 2048x2048 pixels
- Configurable via `image.upload.max-width` and `image.upload.max-height`

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- Configurable via `image.upload.allowed-types` and `image.upload.allowed-extensions`

## Usage Examples

### 1. Upload Hotel Hero Image
```bash
curl -X POST \
  http://localhost:8080/managemyhotel/api/hotels/1/images \
  -H 'Authorization: Bearer your_jwt_token' \
  -F 'file=@hotel_hero.jpg' \
  -F 'category=hotel_hero' \
  -F 'altText=Beautiful hotel exterior view'
```

### 2. Upload Room Type Gallery Image
```bash
curl -X POST \
  http://localhost:8080/managemyhotel/api/hotels/1/images/room-types/2 \
  -H 'Authorization: Bearer your_jwt_token' \
  -F 'file=@suite_interior.jpg' \
  -F 'category=room_type_gallery' \
  -F 'altText=Luxury suite interior with king bed' \
  -F 'displayOrder=1'
```

### 3. Get Hotel Images
```bash
curl -X GET \
  http://localhost:8080/managemyhotel/api/hotels/1/images \
  -H 'Authorization: Bearer your_jwt_token'
```

## Security & Multi-tenancy

- **Tenant Isolation**: All images are isolated by tenant ID
- **Access Control**: JWT-based authentication required
- **Role-based Access**: Different roles have different permissions
- **Image Validation**: Comprehensive validation prevents malicious uploads

## Error Handling

Common error responses:

```json
{
  "success": false,
  "error": "File size exceeds maximum limit of 10MB"
}

{
  "success": false,
  "error": "Hotel already has a hero image"
}

{
  "success": false,
  "error": "Invalid file type. Allowed types: image/jpeg, image/png, image/webp"
}
```

## Next Steps

1. **Configure AWS credentials** in your environment
2. **Run database migration** to create the `hotel_images` table
3. **Test image upload** using the API endpoints
4. **Integrate with frontend** components for image management UI
5. **Set up image optimization** (optional) for better performance

## Production Considerations

1. **S3 Bucket Policy**: Configure appropriate bucket policies for production
2. **CDN Integration**: Consider CloudFront for better image delivery performance
3. **Image Optimization**: Implement automatic image resizing/optimization
4. **Backup Strategy**: Ensure S3 images are included in backup procedures
5. **Monitoring**: Set up CloudWatch monitoring for S3 operations