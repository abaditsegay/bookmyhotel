# Room Types Constants Usage Guide

This guide shows how to use the centralized room type constants throughout the application.

## Available Functions

### 1. `ROOM_TYPES` - Array of room type options
```typescript
import { ROOM_TYPES } from '../constants/roomTypes';

// Usage in dropdowns
{ROOM_TYPES.map((roomType) => (
  <MenuItem key={roomType.value} value={roomType.value}>
    {roomType.label}
  </MenuItem>
))}
```

### 2. `ROOM_TYPE_VALUES` - Array of room type values only
```typescript
import { ROOM_TYPE_VALUES } from '../constants/roomTypes';

// Usage for validation
const isValidRoomType = ROOM_TYPE_VALUES.includes(userInput);
```

### 3. `getRoomTypeLabel(roomType: string)` - Get user-friendly label
```typescript
import { getRoomTypeLabel } from '../constants/roomTypes';

// Usage for display
<Typography>{getRoomTypeLabel('STANDARD')}</Typography>
// Outputs: "Standard Room"
```

### 4. `getRoomBedInfo(roomType: string)` - Get bed information
```typescript
import { getRoomBedInfo } from '../constants/roomTypes';

// Usage for bed info display
<Typography>{getRoomBedInfo('DELUXE')}</Typography>
// Outputs: "King bed"
```

### 5. `isValidRoomType(roomType: string)` - Validate room type
```typescript
import { isValidRoomType } from '../constants/roomTypes';

// Usage for validation
if (isValidRoomType(userInput)) {
  // Process valid room type
}
```

### 6. `getSupportedRoomTypes()` - Get all room type utilities
```typescript
import { getSupportedRoomTypes } from '../constants/roomTypes';

const roomTypeUtils = getSupportedRoomTypes();

// Access all utilities
const values = roomTypeUtils.values;           // ['STANDARD', 'DELUXE', ...]
const options = roomTypeUtils.options;         // [{value: 'STANDARD', label: 'Standard Room'}, ...]
const label = roomTypeUtils.getLabel('SUITE'); // "Suite"
const bedInfo = roomTypeUtils.getBedInfo('DELUXE'); // "King bed"
const isValid = roomTypeUtils.isValid('STANDARD'); // true
```

## Room Type Values Supported

The following room types are supported by the backend and should be used throughout the application:

- `STANDARD` - Standard Room
- `DELUXE` - Deluxe Room  
- `SUITE` - Suite
- `FAMILY` - Family Room
- `ACCESSIBLE` - Accessible Room
- `PRESIDENTIAL` - Presidential Suite

## Examples

### Creating a Room Type Dropdown
```typescript
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ROOM_TYPES } from '../constants/roomTypes';

const RoomTypeSelect = ({ value, onChange }) => (
  <FormControl fullWidth>
    <InputLabel>Room Type</InputLabel>
    <Select value={value} onChange={onChange}>
      {ROOM_TYPES.map((roomType) => (
        <MenuItem key={roomType.value} value={roomType.value}>
          {roomType.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);
```

### Displaying Room Type with Label
```typescript
import React from 'react';
import { Typography } from '@mui/material';
import { getRoomTypeLabel } from '../constants/roomTypes';

const RoomDisplay = ({ room }) => (
  <Typography>
    Room {room.roomNumber} - {getRoomTypeLabel(room.roomType)}
  </Typography>
);
```

### Complete Room Information Display
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { getRoomTypeLabel, getRoomBedInfo } from '../constants/roomTypes';

const RoomInfo = ({ room }) => (
  <Box>
    <Typography variant="h6">
      {getRoomTypeLabel(room.roomType)}
    </Typography>
    <Typography variant="body2">
      {getRoomBedInfo(room.roomType)} • Up to {room.capacity} guests
    </Typography>
  </Box>
);
```

## Migration Notes

When updating existing components:

1. Replace hardcoded room type arrays with `ROOM_TYPES`
2. Replace hardcoded MenuItem elements with `ROOM_TYPES.map()`
3. Replace raw room type display with `getRoomTypeLabel()`
4. Replace hardcoded bed info with `getRoomBedInfo()`
5. Add validation using `isValidRoomType()`

## Best Practices

1. **Always import from constants**: Never hardcode room types in components
2. **Use labels for display**: Use `getRoomTypeLabel()` for user-facing text
3. **Use values for logic**: Use raw values for API calls and logic
4. **Validate input**: Use `isValidRoomType()` for user input validation
5. **Keep it DRY**: Use the centralized functions instead of duplicating logic