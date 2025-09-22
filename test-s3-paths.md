# S3 Path Generation Test

## Current Configuration

- **Bucket Name**: `bookmyhotel-images` (from application.properties)
- **Hotel Image Prefix**: `tenants/{tenantId}/hotels/{hotelId}/`
- **Room Type Image Prefix**: `tenants/{tenantId}/hotels/{hotelId}/room-types/`

## Example Paths

### For Hotel ID 1 in Development Tenant:

**Room Type Images:**
- Standard room: `bookmyhotel-images/tenants/development/hotels/1/room-types/standard.jpg`
- Deluxe room: `bookmyhotel-images/tenants/development/hotels/1/room-types/deluxe.jpg`
- Suite room: `bookmyhotel-images/tenants/development/hotels/1/room-types/suite.jpg`

**Hotel Images:**
- Hotel image: `bookmyhotel-images/tenants/development/hotels/1/hotelImage.jpg`

## Implementation Details

The S3 key generation is handled in:
1. `AwsS3Config.java` - Generates prefixes
2. `HotelImageService.java` - Combines prefix + filename

### Key Code:
```java
// Room type prefix generation
public String getRoomTypeImagePrefix(String tenantId, Long hotelId, Long roomTypeId) {
    return String.format("tenants/%s/hotels/%d/room-types/", tenantId, hotelId);
}

// Final S3 key generation
String finalKey = prefix + filename;
// Results in: tenants/development/hotels/1/room-types/standard.jpg
```

✅ **The current implementation matches your required path pattern!**