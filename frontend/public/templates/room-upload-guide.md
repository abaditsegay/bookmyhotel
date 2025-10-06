# Room Bulk Upload Guide

## Overview
This guide explains how to use the CSV template to bulk upload rooms to your hotel. The template includes all the necessary fields that match your hotel's room management system.

## CSV Template Fields

### Required Fields
1. **Room Number** - Unique identifier for the room (e.g., 101, 102, 201A)
2. **Room Type** - Must be one of: STANDARD, DELUXE, SUITE, FAMILY, PRESIDENTIAL, ACCESSIBLE
3. **Price Per Night** - Room price in decimal format (e.g., 150.00, 220.50)
4. **Capacity** - Maximum number of guests (integer, e.g., 2, 4, 6)

### Optional Fields
5. **Description** - Detailed description of the room and its features
6. **Status** - Room status (AVAILABLE, OCCUPIED, OUT_OF_ORDER, MAINTENANCE, CLEANING, DIRTY). Defaults to AVAILABLE
7. **Is Available** - Whether the room is available for booking (true/false). Defaults to true

## Room Types
- **STANDARD** - Basic comfortable rooms
- **DELUXE** - Upgraded rooms with premium amenities  
- **SUITE** - Large rooms with separate living areas
- **FAMILY** - Rooms designed for families with multiple beds
- **PRESIDENTIAL** - Luxury suites with premium services
- **ACCESSIBLE** - Rooms designed for guests with mobility needs

## Room Status Options
- **AVAILABLE** - Room is ready for guests
- **OCCUPIED** - Room is currently occupied
- **OUT_OF_ORDER** - Room needs repair
- **MAINTENANCE** - Room is under maintenance
- **CLEANING** - Room is being cleaned
- **DIRTY** - Room needs cleaning

## Data Format Guidelines

### Room Numbers
- Use alphanumeric characters (A-Z, 0-9)
- Common formats: 101, 102, 201A, 301B
- Must be unique within your hotel

### Prices
- Use decimal format: 150.00, 220.50
- No currency symbols ($, €, etc.)
- Maximum 2 decimal places

### Descriptions
- Keep under 500 characters
- Use quotes around descriptions with commas
- Example: "Comfortable room with city view"

### Boolean Values
- For "Is Available" field: use true or false (lowercase)

## Sample Data
```csv
Room Number,Room Type,Price Per Night,Capacity,Description,Status,Is Available
101,STANDARD,150.00,2,"Comfortable standard room with modern amenities",AVAILABLE,true
102,DELUXE,220.00,3,"Spacious deluxe room with city view",AVAILABLE,true
```

## Upload Process
1. Download the CSV template
2. Fill in your room data following the format guidelines
3. Save the file as CSV format
4. Upload through the bulk upload interface
5. Review validation results and fix any errors
6. Confirm import to add rooms to your hotel

## Tips for Success
- Ensure room numbers are unique
- Double-check room type spellings (case-sensitive)
- Use consistent price formatting
- Keep descriptions concise but informative
- Test with a small batch first

## Validation Rules
- Room numbers must be unique within your hotel
- Room types must match exactly (case-sensitive)
- Prices must be positive numbers
- Capacity must be positive integers
- Status values must be valid enum values

## Common Issues
1. **Duplicate room numbers** - Each room number must be unique
2. **Invalid room types** - Use exact values: STANDARD, DELUXE, SUITE, FAMILY, PRESIDENTIAL, ACCESSIBLE
3. **Invalid status values** - Use exact values: AVAILABLE, OCCUPIED, OUT_OF_ORDER, MAINTENANCE, CLEANING, DIRTY
4. **Price formatting** - Use decimal format without currency symbols
5. **CSV formatting** - Ensure proper comma separation and quote handling

Need help? Contact support for assistance with bulk room uploads.