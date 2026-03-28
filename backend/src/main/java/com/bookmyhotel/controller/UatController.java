package com.bookmyhotel.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.uat.UatChecklistRequest;
import com.bookmyhotel.dto.uat.UatChecklistResponse;
import com.bookmyhotel.dto.uat.UatDefectRequest;
import com.bookmyhotel.dto.uat.UatDefectResponse;
import com.bookmyhotel.dto.uat.UatWorkspaceHotelResponse;
import com.bookmyhotel.service.UatService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/uat")
@PreAuthorize("hasAnyRole('TESTER','ADMIN','SUPER_ADMIN')")
public class UatController {

    private final UatService uatService;

    public UatController(UatService uatService) {
        this.uatService = uatService;
    }

    @GetMapping("/workspace-hotel")
    public ResponseEntity<UatWorkspaceHotelResponse> getWorkspaceHotel(Authentication authentication) {
        return ResponseEntity.ok(uatService.getWorkspaceHotel(authentication));
    }

    @GetMapping("/hotels/{hotelId}/checklist")
    public ResponseEntity<UatChecklistResponse> getChecklist(@PathVariable Long hotelId, Authentication authentication) {
        return ResponseEntity.ok(uatService.getChecklist(hotelId, authentication));
    }

    @PutMapping("/hotels/{hotelId}/checklist")
    public ResponseEntity<UatChecklistResponse> upsertChecklist(@PathVariable Long hotelId,
            @Valid @RequestBody UatChecklistRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(uatService.upsertChecklist(hotelId, request, authentication));
    }

    @GetMapping("/hotels/{hotelId}/defects")
    public ResponseEntity<List<UatDefectResponse>> getDefects(@PathVariable Long hotelId,
            Authentication authentication) {
        return ResponseEntity.ok(uatService.getDefects(hotelId, authentication));
    }

    @PostMapping("/hotels/{hotelId}/defects")
    public ResponseEntity<UatDefectResponse> createDefect(@PathVariable Long hotelId,
            @Valid @RequestBody UatDefectRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(uatService.createDefect(hotelId, request, authentication));
    }

    @PutMapping("/hotels/{hotelId}/defects/{defectId}")
    public ResponseEntity<UatDefectResponse> updateDefect(@PathVariable Long hotelId,
            @PathVariable Long defectId,
            @Valid @RequestBody UatDefectRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(uatService.updateDefect(hotelId, defectId, request, authentication));
    }
}