package com.bookmyhotel.service;

import com.bookmyhotel.config.CacheConfig;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RoomBulkUploadService {

    private static final Logger logger = LoggerFactory.getLogger(RoomBulkUploadService.class);

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    public RoomBulkUploadService(RoomRepository roomRepository, HotelRepository hotelRepository) {
        this.roomRepository = roomRepository;
        this.hotelRepository = hotelRepository;
    }

    public byte[] getTemplateFile() throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/hotel-rooms-template.csv");
        try (InputStream inputStream = resource.getInputStream()) {
            return inputStream.readAllBytes();
        }
    }

    public Map<String, Object> validateCsv(Long hotelId, MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> validationErrors = new ArrayList<>();
        List<Map<String, Object>> successfulRooms = new ArrayList<>();

        try {
            // Basic file validation
            if (file == null || file.isEmpty()) {
                result.put("success", false);
                result.put("message", "File is required");
                return result;
            }

            if (file.getSize() > 5 * 1024 * 1024) { // 5MB
                result.put("success", false);
                result.put("message", "File size exceeds maximum limit of 5MB");
                return result;
            }

            if (file.getOriginalFilename() == null || !file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
                result.put("success", false);
                result.put("message", "Only CSV files are supported");
                return result;
            }

            // Parse CSV content
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
                String line;
                int rowNumber = 0;
                String[] headers = null;

                while ((line = reader.readLine()) != null) {
                    rowNumber++;

                    if (rowNumber == 1) {
                        // Parse headers
                        headers = line.split(",");
                        // System.out.println("CSV Headers: " + java.util.Arrays.toString(headers));
                        continue;
                    }

                    // Parse data rows
                    String[] values = line.split(",");
                    // System.out.println("Row " + rowNumber + " values: " + java.util.Arrays.toString(values));
                    Map<String, Object> room = new HashMap<>();
                    List<String> rowErrors = new ArrayList<>();

                    for (int i = 0; i < headers.length && i < values.length; i++) {
                        String header = headers[i].trim().toLowerCase();
                        String value = values[i].trim().replace("\"", "");

                        switch (header) {
                            case "room number" -> {
                                room.put("roomNumber", value);
                                if (value.isEmpty()) {
                                    rowErrors.add("Room Number is required");
                                }
                            }
                            case "room type" -> {
                                room.put("roomType", value);
                                if (value.isEmpty()) {
                                    rowErrors.add("Room Type is required");
                                }
                            }
                            case "price per night" -> {
                                try {
                                    double price = Double.parseDouble(value);
                                    if (price <= 0) {
                                        rowErrors.add("Price Per Night must be greater than 0");
                                    }
                                    room.put("pricePerNight", price);
                                } catch (NumberFormatException e) {
                                    rowErrors.add("Price Per Night must be a valid number");
                                    room.put("pricePerNight", value);
                                }
                            }
                            case "capacity" -> {
                                try {
                                    int capacity = Integer.parseInt(value);
                                    if (capacity <= 0 || capacity > 20) {
                                        rowErrors.add("Capacity must be between 1 and 20");
                                    }
                                    room.put("capacity", capacity);
                                } catch (NumberFormatException e) {
                                    rowErrors.add("Capacity must be a valid number");
                                    room.put("capacity", value);
                                }
                            }
                            case "description" -> room.put("description", value);
                            case "status" -> room.put("status", value);
                            case "is available" -> room.put("isAvailable", "true".equalsIgnoreCase(value));
                        }
                    }

                    // Ensure all required fields are present
                    if (!room.containsKey("roomNumber") || room.get("roomNumber").toString().isEmpty()) {
                        rowErrors.add("Room Number is required");
                    }
                    if (!room.containsKey("roomType") || room.get("roomType").toString().isEmpty()) {
                        rowErrors.add("Room Type is required");
                    }
                    if (!room.containsKey("pricePerNight")) {
                        rowErrors.add("Price Per Night is required");
                    }
                    if (!room.containsKey("capacity")) {
                        rowErrors.add("Capacity is required");
                    }

                    // System.out.println("Parsed room: " + room);
                    // System.out.println("Row errors: " + rowErrors);

                    // Add validation errors for this row
                    for (String error : rowErrors) {
                        Map<String, Object> validationError = new HashMap<>();
                        validationError.put("row", rowNumber);
                        validationError.put("message", error);
                        validationErrors.add(validationError);
                    }

                    // Add room if no critical errors
                    if (rowErrors.isEmpty()) {
                        successfulRooms.add(room);
                        // System.out.println("Added successful room: " + room.get("roomNumber"));
                    } else {
                        // System.out.println("Skipped room due to errors: " + rowErrors);
                    }
                }
            }

            // Prepare result
            result.put("success", true);
            result.put("message", "Validation completed");

            Map<String, Object> data = new HashMap<>();
            data.put("successfulRooms", successfulRooms);
            data.put("validationErrors", validationErrors);
            result.put("data", data);

        } catch (IOException e) {
            // System.err.println("Error reading CSV file: " + e.getMessage());
            result.put("success", false);
            result.put("message", "Error reading CSV file: " + e.getMessage());
        } catch (Exception e) {
            // System.err.println("Unexpected error during CSV validation: " + e.getMessage());
            result.put("success", false);
            result.put("message", "An unexpected error occurred while processing your request");
        }

        return result;
    }

    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_TYPES_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true)
    })
    public Map<String, Object> uploadRoomsFromCsv(Long hotelId, MultipartFile file, boolean skipErrors) {
        Map<String, Object> result = new HashMap<>();

        // System.out.println("🔥 UPLOAD SERVICE CALLED");
        // System.out.println("🔥 Hotel ID: " + hotelId);
        // System.out.println("🔥 File: " + (file != null ? file.getOriginalFilename() : "null"));
        // System.out.println("🔥 Skip errors: " + skipErrors);

        // First validate the CSV
        Map<String, Object> validation = validateCsv(hotelId, file);
        if (!(Boolean) validation.get("success")) {
            // System.out.println("🔥 Validation failed: " + validation.get("message"));
            return validation;
        }

        Map<String, Object> data = (Map<String, Object>) validation.get("data");
        List<Map<String, Object>> successfulRooms = (List<Map<String, Object>>) data.get("successfulRooms");
        List<Map<String, Object>> validationErrors = (List<Map<String, Object>>) data.get("validationErrors");

        // System.out.println("🔥 Successful rooms from validation: " + successfulRooms.size());
        // System.out.println("🔥 Validation errors: " + validationErrors.size());

        if (!skipErrors && !validationErrors.isEmpty()) {
            // System.out.println("🔥 Stopping due to validation errors");
            result.put("success", false);
            result.put("message", "Validation errors found. Please fix them before importing.");
            result.put("data", data);
            return result;
        }

        // Get the hotel object
        Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
        if (hotel == null) {
            // System.out.println("🔥 Hotel not found: " + hotelId);
            result.put("success", false);
            result.put("message", "Hotel not found");
            return result;
        }

        // System.out.println("🔥 Found hotel: " + hotel.getName());

        List<Room> importedRooms = new ArrayList<>();
        List<String> importErrors = new ArrayList<>();

        try {
            for (Map<String, Object> roomData : successfulRooms) {
                // System.out.println("🔥 Processing room: " + roomData);
                try {
                    Room room = new Room();
                    room.setHotel(hotel);
                    room.setRoomNumber((String) roomData.get("roomNumber"));

                    // Convert room type string to enum
                    String roomTypeStr = (String) roomData.get("roomType");
                    // System.out.println("🔥 Room type string: " + roomTypeStr);
                    try {
                        RoomType roomType = RoomType.valueOf(roomTypeStr.toUpperCase());
                        room.setRoomType(roomType);
                        // System.out.println("🔥 Set room type: " + roomType);
                    } catch (IllegalArgumentException e) {
                        String error = "Invalid room type '" + roomTypeStr + "' for room " + roomData.get("roomNumber");
                        // System.out.println("🔥 " + error);
                        importErrors.add(error);
                        continue;
                    }

                    // Convert price to BigDecimal
                    Double priceDouble = (Double) roomData.get("pricePerNight");
                    room.setPricePerNight(BigDecimal.valueOf(priceDouble));
                    // System.out.println("🔥 Set price: " + priceDouble);

                    room.setCapacity((Integer) roomData.get("capacity"));
                    room.setDescription((String) roomData.getOrDefault("description", ""));

                    // Convert status string to enum
                    String statusStr = (String) roomData.getOrDefault("status", "AVAILABLE");
                    try {
                        RoomStatus status = RoomStatus.valueOf(statusStr.toUpperCase());
                        room.setStatus(status);
                        // System.out.println("🔥 Set status: " + status);
                    } catch (IllegalArgumentException e) {
                        room.setStatus(RoomStatus.AVAILABLE);
                        // System.out.println("🔥 Defaulted status to AVAILABLE");
                    }

                    room.setIsAvailable((Boolean) roomData.getOrDefault("isAvailable", true));

                    // Check if room number already exists for this hotel
                    if (roomRepository.existsByHotelAndRoomNumber(hotel, room.getRoomNumber())) {
                        String error = "Room " + room.getRoomNumber() + " already exists";
                        // System.out.println("🔥 " + error);
                        importErrors.add(error);
                        continue;
                    }

                    // System.out.println("🔥 About to save room: " + room.getRoomNumber());
                    Room savedRoom = roomRepository.save(room);
                    // System.out.println("🔥 Saved room with ID: " + savedRoom.getId());
                    importedRooms.add(savedRoom);

                } catch (Exception e) {
                    String error = "Failed to import room " + roomData.get("roomNumber") + ": " + e.getMessage();
                    // System.out.println("🔥 " + error);
                    logger.error("Operation failed", e);
                    importErrors.add(error);
                }
            }

            Map<String, Object> resultData = new HashMap<>();
            resultData.put("importedRooms", importedRooms);
            resultData.put("importErrors", importErrors);
            resultData.put("totalProcessed", successfulRooms.size());
            resultData.put("successfulImports", importedRooms.size());
            resultData.put("failedImports", importErrors.size());

            // System.out.println("🔥 Final result data: " + resultData);

            result.put("success", true);
            result.put("message", String.format("Import completed: %d successful, %d failed",
                    importedRooms.size(), importErrors.size()));
            result.put("data", resultData);

        } catch (Exception e) {
            // System.err.println("Error during room import: " + e.getMessage());
            logger.error("Operation failed", e);
            result.put("success", false);
            result.put("message", "Error during import: " + e.getMessage());
        }

        return result;
    }
}