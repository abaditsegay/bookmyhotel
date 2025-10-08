/**
 * Room Type Constants
 * 
 * This file contains the standardized room type definitions used throughout the application.
 * These values must match the backend RoomType enum and database schema.
 */

export interface RoomTypeOption {
  value: string;
  label: string;
}

/**
 * Standard room types - matches backend enum and database
 */
export const ROOM_TYPES: RoomTypeOption[] = [
  { value: 'STANDARD', label: 'Standard Room' },
  { value: 'DELUXE', label: 'Deluxe Room' },
  { value: 'SUITE', label: 'Suite' },
  { value: 'FAMILY', label: 'Family Room' },
  { value: 'ACCESSIBLE', label: 'Accessible Room' },
  { value: 'PRESIDENTIAL', label: 'Presidential Suite' }
];

/**
 * Room type values only (for arrays where only values are needed)
 */
export const ROOM_TYPE_VALUES: string[] = ROOM_TYPES.map(type => type.value);

/**
 * Get room type label by value
 */
export const getRoomTypeLabel = (roomType: string): string => {
  const type = ROOM_TYPES.find(t => t.value === roomType);
  return type?.label || roomType;
};

/**
 * Get bed information based on room type
 */
export const getRoomBedInfo = (roomType: string): string => {
  const bedInfo: { [key: string]: string } = {
    SINGLE: '1 bed',
    DOUBLE: '2 beds',
    STANDARD: '2 beds',
    DELUXE: 'King bed',
    SUITE: 'Multiple rooms',
    FAMILY: 'Multiple beds',
    ACCESSIBLE: 'Accessible bed',
    PRESIDENTIAL: 'Luxury suite'
  };
  return bedInfo[roomType] || 'Luxury suite';
};

/**
 * Check if a room type is valid
 */
export const isValidRoomType = (roomType: string): boolean => {
  return ROOM_TYPE_VALUES.includes(roomType);
};

/**
 * Get all room types as options for dropdowns
 */
export const getRoomTypeOptions = (): RoomTypeOption[] => {
  return ROOM_TYPES;
};

/**
 * Get room type enum values (for backend compatibility)
 */
export const getRoomTypeEnumValues = (): string[] => {
  return ROOM_TYPE_VALUES;
};

/**
 * Simple function that returns the room type enum that the backend supports
 * This function can be used anywhere in the application where room types are needed
 */
export const getSupportedRoomTypes = () => {
  return {
    values: ROOM_TYPE_VALUES,
    options: ROOM_TYPES,
    getLabel: getRoomTypeLabel,
    getBedInfo: getRoomBedInfo,
    isValid: isValidRoomType
  };
};
