package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomRepository;

@ExtendWith(MockitoExtension.class)
class RoomBulkUploadServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private RoomBulkUploadService roomBulkUploadService;

    @Test
    void validateCsvShouldRejectMissingFile() {
        Map<String, Object> result = roomBulkUploadService.validateCsv(1L, null);

        assertFalse((Boolean) result.get("success"));
        assertEquals("File is required", result.get("message"));
    }

    @Test
    void validateCsvShouldRejectNonCsvFiles() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "rooms.txt",
                "text/plain",
                "content".getBytes(StandardCharsets.UTF_8));

        Map<String, Object> result = roomBulkUploadService.validateCsv(1L, file);

        assertFalse((Boolean) result.get("success"));
        assertEquals("Only CSV files are supported", result.get("message"));
    }

    @Test
    void validateCsvShouldParseValidRowsAndCollectValidationErrors() {
        MockMultipartFile file = csvFile(
                "Room Number,Room Type,Price Per Night,Capacity,Description,Status,Is Available\n"
                        + "101,STANDARD,125.5,2,Main room,AVAILABLE,true\n"
                        + "102,,0,0,Bad row,AVAILABLE,true\n");

        Map<String, Object> result = roomBulkUploadService.validateCsv(1L, file);

        assertTrue((Boolean) result.get("success"));
        Map<String, Object> data = castMap(result.get("data"));
        List<Map<String, Object>> successfulRooms = castList(data.get("successfulRooms"));
        List<Map<String, Object>> validationErrors = castList(data.get("validationErrors"));

        assertEquals(1, successfulRooms.size());
        assertEquals("101", successfulRooms.get(0).get("roomNumber"));
        assertEquals(4, validationErrors.size());
    }

    @Test
    void uploadRoomsFromCsvShouldStopOnValidationErrorsWhenSkipErrorsIsFalse() {
        MockMultipartFile file = csvFile(
                "Room Number,Room Type,Price Per Night,Capacity\n"
                        + "101,,120,2\n");

        Map<String, Object> result = roomBulkUploadService.uploadRoomsFromCsv(1L, file, false);

        assertFalse((Boolean) result.get("success"));
        assertEquals("Validation errors found. Please fix them before importing.", result.get("message"));
        verify(hotelRepository, never()).findById(any());
    }

    @Test
    void uploadRoomsFromCsvShouldRejectMissingHotel() {
        MockMultipartFile file = csvFile(
                "Room Number,Room Type,Price Per Night,Capacity\n"
                        + "101,STANDARD,120,2\n");
        when(hotelRepository.findById(55L)).thenReturn(Optional.empty());

        Map<String, Object> result = roomBulkUploadService.uploadRoomsFromCsv(55L, file, true);

        assertFalse((Boolean) result.get("success"));
        assertEquals("Hotel not found", result.get("message"));
    }

    @Test
    void uploadRoomsFromCsvShouldRejectRoomLimitExceeded() {
        MockMultipartFile file = csvFile(
                "Room Number,Room Type,Price Per Night,Capacity\n"
                        + "101,STANDARD,120,2\n"
                        + "102,DELUXE,180,3\n");
        Hotel hotel = hotel(10L, 3);
        when(hotelRepository.findById(10L)).thenReturn(Optional.of(hotel));
        when(roomRepository.countByHotel(hotel)).thenReturn(2L);

        Map<String, Object> result = roomBulkUploadService.uploadRoomsFromCsv(10L, file, true);

        assertFalse((Boolean) result.get("success"));
        assertTrue(((String) result.get("message")).contains("Room limit exceeded"));
        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    void uploadRoomsFromCsvShouldImportValidRoomsAndReportImportErrors() {
        MockMultipartFile file = csvFile(
                "Room Number,Room Type,Price Per Night,Capacity,Status,Is Available\n"
                        + "101,STANDARD,120,2,AVAILABLE,true\n"
                        + "102,UNKNOWN,180,3,AVAILABLE,true\n"
                        + "103,DELUXE,200,2,AVAILABLE,true\n");
        Hotel hotel = hotel(11L, 10);

        when(hotelRepository.findById(11L)).thenReturn(Optional.of(hotel));
        when(roomRepository.countByHotel(hotel)).thenReturn(0L);
        when(roomRepository.existsByHotelAndRoomNumber(hotel, "101")).thenReturn(false);
        when(roomRepository.existsByHotelAndRoomNumber(hotel, "103")).thenReturn(true);
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
            Room room = invocation.getArgument(0);
            room.setId(500L);
            return room;
        });

        Map<String, Object> result = roomBulkUploadService.uploadRoomsFromCsv(11L, file, true);

        assertTrue((Boolean) result.get("success"));
        assertEquals("Import completed: 1 successful, 2 failed", result.get("message"));
        Map<String, Object> data = castMap(result.get("data"));
        assertEquals(1, data.get("successfulImports"));
        assertEquals(2, data.get("failedImports"));

        List<String> importErrors = castList(data.get("importErrors"));
        assertTrue(importErrors.stream().anyMatch(error -> error.contains("Invalid room type 'UNKNOWN'")));
        assertTrue(importErrors.stream().anyMatch(error -> error.contains("Room 103 already exists")));
        verify(roomRepository).save(any(Room.class));
    }

    private MockMultipartFile csvFile(String content) {
        return new MockMultipartFile(
                "file",
                "rooms.csv",
                "text/csv",
                content.getBytes(StandardCharsets.UTF_8));
    }

    private Hotel hotel(Long id, Integer numberOfRooms) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName("Hotel " + id);
        hotel.setAddress("Address " + id);
        hotel.setNumberOfRooms(numberOfRooms);
        return hotel;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Object value) {
        return (Map<String, Object>) value;
    }

    @SuppressWarnings("unchecked")
    private <T> List<T> castList(Object value) {
        return (List<T>) value;
    }
}