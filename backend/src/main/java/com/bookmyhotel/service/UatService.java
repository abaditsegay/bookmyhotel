package com.bookmyhotel.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Comparator;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.uat.UatChecklistRequest;
import com.bookmyhotel.dto.uat.UatChecklistResponse;
import com.bookmyhotel.dto.uat.UatDefectRequest;
import com.bookmyhotel.dto.uat.UatDefectResponse;
import com.bookmyhotel.dto.uat.UatWorkspaceHotelResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.UatChecklist;
import com.bookmyhotel.entity.UatDefect;
import com.bookmyhotel.entity.UatDefectSeverity;
import com.bookmyhotel.entity.UatDefectStatus;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.UatChecklistRepository;
import com.bookmyhotel.repository.UatDefectRepository;
import com.bookmyhotel.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@Transactional
public class UatService {

    private static final TypeReference<Map<String, Boolean>> CHECKLIST_TYPE = new TypeReference<>() {
    };

    private final UatChecklistRepository uatChecklistRepository;
    private final UatDefectRepository uatDefectRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final String sharedHotelIdProperty;
    private final String sharedHotelName;

    public UatService(UatChecklistRepository uatChecklistRepository,
            UatDefectRepository uatDefectRepository,
            HotelRepository hotelRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            @Value("${app.uat.shared-hotel-id:}") String sharedHotelIdProperty,
            @Value("${app.uat.shared-hotel-name:Grand Test Hotel}") String sharedHotelName) {
        this.uatChecklistRepository = uatChecklistRepository;
        this.uatDefectRepository = uatDefectRepository;
        this.hotelRepository = hotelRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.sharedHotelIdProperty = sharedHotelIdProperty;
        this.sharedHotelName = sharedHotelName;
    }

    public UatWorkspaceHotelResponse getWorkspaceHotel(Authentication authentication) {
        User actor = loadActor(authentication);
        Hotel hotel = resolveSharedWorkspaceHotel(actor);

        UatWorkspaceHotelResponse response = new UatWorkspaceHotelResponse();
        response.setHotelId(hotel.getId());
        response.setHotelName(hotel.getName());
        response.setCity(hotel.getCity());
        response.setCountry(hotel.getCountry());
        return response;
    }

    public UatChecklistResponse getChecklist(Long hotelId, Authentication authentication) {
        User actor = loadActor(authentication);
        Hotel hotel = validateWorkspaceHotelAccess(hotelId, actor);
        return toChecklistResponse(getOrCreateChecklist(hotel), hotel);
    }

    public UatChecklistResponse upsertChecklist(Long hotelId, UatChecklistRequest request, Authentication authentication) {
        User actor = loadActor(authentication);
        Hotel hotel = validateWorkspaceHotelAccess(hotelId, actor);

        UatChecklist checklist = getOrCreateChecklist(hotel);
        checklist.setTesterName(request.getTesterName());
        checklist.setTestEnvironment(request.getTestEnvironment());
        checklist.setTestDate(request.getTestDate());
        checklist.setBuildVersion(request.getBuildVersion());
        checklist.setHotelTenantTested(request.getHotelTenantTested());
        checklist.setChecklistItemsJson(writeChecklistItems(request.getChecklistItems()));
        checklist.setFinalDecision(request.getFinalDecision());
        checklist.setQaLead(request.getQaLead());
        checklist.setBusinessOwner(request.getBusinessOwner());
        checklist.setProductOwner(request.getProductOwner());
        checklist.setApprovalDate(request.getApprovalDate());

        return toChecklistResponse(uatChecklistRepository.save(checklist), hotel);
    }

    public List<UatDefectResponse> getDefects(Long hotelId, Authentication authentication) {
        User actor = loadActor(authentication);
        validateWorkspaceHotelAccess(hotelId, actor);
        return uatDefectRepository.findByHotelIdOrderByUpdatedAtDescCreatedAtDesc(hotelId).stream()
                .map(this::toDefectResponse)
                .collect(Collectors.toList());
    }

    public UatDefectResponse createDefect(Long hotelId, UatDefectRequest request, Authentication authentication) {
        User actor = loadActor(authentication);
        Hotel hotel = validateWorkspaceHotelAccess(hotelId, actor);
        boolean platformAdmin = isPlatformAdmin(actor);

        UatDefect defect = new UatDefect();
        defect.setHotel(hotel);
        defect.setSummary(request.getSummary());
        defect.setTesterDetail(request.getTesterDetail());
        defect.setSeverity(Optional.ofNullable(request.getSeverity()).orElse(UatDefectSeverity.MEDIUM));
        defect.setBlockingRelease(Boolean.TRUE.equals(request.getBlockingRelease()));
        defect.setCreatedByUser(actor);
        defect.setUpdatedByUser(actor);

        if (platformAdmin) {
            defect.setAdminNotes(request.getAdminNotes());
            defect.setFixDetails(request.getFixDetails());
            defect.setStatus(Optional.ofNullable(request.getStatus()).orElse(UatDefectStatus.OPEN));
            if (defect.getStatus() == UatDefectStatus.FIXED || defect.getStatus() == UatDefectStatus.CLOSED) {
                defect.setResolvedAt(LocalDateTime.now());
            }
        }

        return toDefectResponse(uatDefectRepository.save(defect));
    }

    public UatDefectResponse updateDefect(Long hotelId, Long defectId, UatDefectRequest request,
            Authentication authentication) {
        User actor = loadActor(authentication);
        validateWorkspaceHotelAccess(hotelId, actor);
        boolean platformAdmin = isPlatformAdmin(actor);

        UatDefect defect = uatDefectRepository.findById(defectId)
                .orElseThrow(() -> new ResourceNotFoundException("UAT defect not found with id: " + defectId));

        if (!defect.getHotel().getId().equals(hotelId)) {
            throw new ResourceNotFoundException("UAT defect does not belong to hotel id: " + hotelId);
        }

        defect.setSummary(request.getSummary());
        defect.setTesterDetail(request.getTesterDetail());
        defect.setSeverity(Optional.ofNullable(request.getSeverity()).orElse(defect.getSeverity()));
        defect.setBlockingRelease(Optional.ofNullable(request.getBlockingRelease()).orElse(defect.getBlockingRelease()));

        if (!platformAdmin) {
            if (request.getAdminNotes() != null || request.getFixDetails() != null || request.getStatus() != null) {
                throw new AccessDeniedException("Only platform administrators can update defect notes, fix details, or status");
            }
        } else {
            defect.setAdminNotes(request.getAdminNotes());
            defect.setFixDetails(request.getFixDetails());
            if (request.getStatus() != null) {
                defect.setStatus(request.getStatus());
                if (request.getStatus() == UatDefectStatus.FIXED || request.getStatus() == UatDefectStatus.CLOSED) {
                    defect.setResolvedAt(LocalDateTime.now());
                } else {
                    defect.setResolvedAt(null);
                }
            }
        }

        defect.setUpdatedByUser(actor);
        return toDefectResponse(uatDefectRepository.save(defect));
    }

    private UatChecklist getOrCreateChecklist(Hotel hotel) {
        return uatChecklistRepository.findByHotelId(hotel.getId()).orElseGet(() -> {
            UatChecklist checklist = new UatChecklist();
            checklist.setHotel(hotel);
            checklist.setHotelTenantTested(hotel.getName());
            checklist.setChecklistItemsJson(writeChecklistItems(new LinkedHashMap<>()));
            return uatChecklistRepository.save(checklist);
        });
    }

    private Hotel validateWorkspaceHotelAccess(Long hotelId, User actor) {
        Hotel workspaceHotel = resolveSharedWorkspaceHotel(actor);

        if (!workspaceHotel.getId().equals(hotelId)) {
            throw new AccessDeniedException("UAT workspace is restricted to the shared test hotel");
        }

        return workspaceHotel;
    }

    private Hotel resolveSharedWorkspaceHotel(User actor) {
        if (sharedHotelIdProperty != null && !sharedHotelIdProperty.isBlank()) {
            try {
                Long configuredHotelId = Long.valueOf(sharedHotelIdProperty.trim());
                return hotelRepository.findByIdAndIsActiveTrue(configuredHotelId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Configured shared UAT hotel not found or inactive: " + configuredHotelId));
            } catch (NumberFormatException exception) {
                throw new IllegalStateException("Invalid app.uat.shared-hotel-id value: " + sharedHotelIdProperty, exception);
            }
        }

        Hotel resolvedByName = resolveByConfiguredName();
        if (resolvedByName != null) {
            return resolvedByName;
        }

        Hotel resolvedByTestKeyword = resolveByTestKeyword();
        if (resolvedByTestKeyword != null) {
            return resolvedByTestKeyword;
        }

        if (actor.getHotel() != null && actor.getHotel().getIsActive()) {
            return actor.getHotel();
        }

        throw new ResourceNotFoundException(
                "No shared UAT hotel is configured. Set app.uat.shared-hotel-id or app.uat.shared-hotel-name, or create one active hotel with 'test' in the name.");
    }

    private Hotel resolveByConfiguredName() {
        if (sharedHotelName == null || sharedHotelName.isBlank()) {
            return null;
        }

        List<Hotel> matches = hotelRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(sharedHotelName.trim());
        return matches.stream()
                .sorted(Comparator.comparing(Hotel::getName, String.CASE_INSENSITIVE_ORDER))
                .filter(hotel -> hotel.getName() != null && hotel.getName().equalsIgnoreCase(sharedHotelName.trim()))
                .findFirst()
                .orElse(matches.isEmpty() ? null : matches.get(0));
    }

    private Hotel resolveByTestKeyword() {
        List<Hotel> matches = hotelRepository.findByNameContainingIgnoreCaseAndIsActiveTrue("test");
        return matches.stream()
                .sorted(Comparator.comparing(Hotel::getName, String.CASE_INSENSITIVE_ORDER))
                .findFirst()
                .orElse(null);
    }

    private User loadActor(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("Authentication is required");
        }

        return userRepository.findByEmailWithHotel(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private boolean isPlatformAdmin(User actor) {
        return actor.getRoles() != null && actor.getRoles().stream()
                .anyMatch(role -> role.name().equals("ADMIN") || role.name().equals("SUPER_ADMIN"));
    }

    private UatChecklistResponse toChecklistResponse(UatChecklist checklist, Hotel hotel) {
        UatChecklistResponse response = new UatChecklistResponse();
        response.setId(checklist.getId());
        response.setHotelId(hotel.getId());
        response.setHotelName(hotel.getName());
        response.setTesterName(checklist.getTesterName());
        response.setTestEnvironment(checklist.getTestEnvironment());
        response.setTestDate(checklist.getTestDate());
        response.setBuildVersion(checklist.getBuildVersion());
        response.setHotelTenantTested(checklist.getHotelTenantTested());
        response.setChecklistItems(readChecklistItems(checklist.getChecklistItemsJson()));
        response.setFinalDecision(checklist.getFinalDecision());
        response.setQaLead(checklist.getQaLead());
        response.setBusinessOwner(checklist.getBusinessOwner());
        response.setProductOwner(checklist.getProductOwner());
        response.setApprovalDate(checklist.getApprovalDate());
        response.setCreatedAt(checklist.getCreatedAt());
        response.setUpdatedAt(checklist.getUpdatedAt());
        return response;
    }

    private UatDefectResponse toDefectResponse(UatDefect defect) {
        UatDefectResponse response = new UatDefectResponse();
        response.setId(defect.getId());
        response.setDefectId("DEF-" + defect.getId());
        response.setHotelId(defect.getHotel().getId());
        response.setSummary(defect.getSummary());
        response.setTesterDetail(defect.getTesterDetail());
        response.setSeverity(defect.getSeverity());
        response.setBlockingRelease(defect.getBlockingRelease());
        response.setAdminNotes(defect.getAdminNotes());
        response.setFixDetails(defect.getFixDetails());
        response.setStatus(defect.getStatus());
        response.setCreatedByName(getFullName(defect.getCreatedByUser()));
        response.setUpdatedByName(getFullName(defect.getUpdatedByUser()));
        response.setCreatedAt(defect.getCreatedAt());
        response.setUpdatedAt(defect.getUpdatedAt());
        response.setResolvedAt(defect.getResolvedAt());
        return response;
    }

    private String writeChecklistItems(Map<String, Boolean> checklistItems) {
        try {
            return objectMapper.writeValueAsString(Optional.ofNullable(checklistItems).orElseGet(LinkedHashMap::new));
        } catch (IOException exception) {
            throw new RuntimeException("Failed to serialize UAT checklist items", exception);
        }
    }

    private Map<String, Boolean> readChecklistItems(String checklistItemsJson) {
        if (checklistItemsJson == null || checklistItemsJson.isBlank()) {
            return new LinkedHashMap<>();
        }

        try {
            return objectMapper.readValue(checklistItemsJson, CHECKLIST_TYPE);
        } catch (IOException exception) {
            throw new RuntimeException("Failed to deserialize UAT checklist items", exception);
        }
    }

    private String getFullName(User user) {
        if (user == null) {
            return null;
        }
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}