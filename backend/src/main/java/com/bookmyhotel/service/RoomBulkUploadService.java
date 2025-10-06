package com.bookmyhotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomBulkUploadService {

    public byte[] getTemplateFile() throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/hotel-rooms-template.csv");
        try (InputStream inputStream = resource.getInputStream()) {
            return inputStream.readAllBytes();
        }
    }

    public String validateCsv(Long hotelId, MultipartFile file) {
        // Basic validation for now
        if (file == null || file.isEmpty()) {
            return "File is required";
        }
        
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB
            return "File size exceeds maximum limit of 5MB";
        }
        
        if (!file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
            return "Only CSV files are supported";
        }
        
        return "Validation passed - feature in development";
    }

    public String uploadRoomsFromCsv(Long hotelId, MultipartFile file, boolean skipErrors) {
        String validation = validateCsv(hotelId, file);
        if (!validation.contains("passed")) {
            return validation;
        }
        
        return "Bulk upload feature is in development. Template downloaded successfully.";
    }
}