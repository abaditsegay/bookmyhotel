package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.bookmyhotel.dto.RoomChargeCreateRequest;
import com.bookmyhotel.dto.RoomChargeResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.RoomChargeType;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.HotelService;
import com.bookmyhotel.service.RoomChargeService;

@ExtendWith(MockitoExtension.class)
class RoomChargeControllerTest {

    @Mock
    private RoomChargeService roomChargeService;

    @Mock
    private HotelService hotelService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RoomChargeController roomChargeController;

    private User hotelUser;

    @BeforeEach
    void setUp() {
        Hotel hotel = new Hotel();
        hotel.setId(77L);

        hotelUser = new User();
        hotelUser.setEmail("frontdesk@example.com");
        hotelUser.setPassword("encoded-password");
        hotelUser.setFirstName("Front");
        hotelUser.setLastName("Desk");
        hotelUser.setHotel(hotel);
        hotelUser.setRoles(Set.of(UserRole.FRONTDESK));
    }

    @Test
    void reservationScopedEndpointsShouldPassHotelIdBeforeReservationId() {
                when(authentication.getName()).thenReturn("frontdesk@example.com");
                when(userRepository.findByEmail("frontdesk@example.com")).thenReturn(Optional.of(hotelUser));

        RoomChargeResponse response = new RoomChargeResponse();
        response.setHotelId(77L);
        response.setReservationId(55L);
        response.setDescription("Laundry service");
        response.setAmount(new BigDecimal("45.00"));

        when(roomChargeService.getRoomChargesForReservation(77L, 55L)).thenReturn(List.of(response));
        when(roomChargeService.getUnpaidChargesForReservation(77L, 55L)).thenReturn(List.of(response));
        when(roomChargeService.getTotalUnpaidAmount(77L, 55L)).thenReturn(new BigDecimal("45.00"));

        ResponseEntity<List<RoomChargeResponse>> allChargesResponse = roomChargeController
                .getRoomChargesForReservation(55L, authentication);
        ResponseEntity<List<RoomChargeResponse>> unpaidChargesResponse = roomChargeController
                .getUnpaidChargesForReservation(55L, authentication);
        ResponseEntity<BigDecimal> totalUnpaidResponse = roomChargeController
                .getTotalUnpaidAmount(55L, authentication);

        assertEquals(HttpStatus.OK, allChargesResponse.getStatusCode());
        assertEquals(HttpStatus.OK, unpaidChargesResponse.getStatusCode());
        assertEquals(HttpStatus.OK, totalUnpaidResponse.getStatusCode());
        assertNotNull(allChargesResponse.getBody());
        assertEquals(1, allChargesResponse.getBody().size());
        assertNotNull(unpaidChargesResponse.getBody());
        assertEquals(1, unpaidChargesResponse.getBody().size());
        assertEquals(new BigDecimal("45.00"), totalUnpaidResponse.getBody());

        verify(roomChargeService).getRoomChargesForReservation(77L, 55L);
        verify(roomChargeService).getUnpaidChargesForReservation(77L, 55L);
        verify(roomChargeService).getTotalUnpaidAmount(77L, 55L);
    }

    @Test
    void mutationEndpointsShouldPassHotelIdBeforeChargeId() {
                when(authentication.getName()).thenReturn("frontdesk@example.com");
                when(userRepository.findByEmail("frontdesk@example.com")).thenReturn(Optional.of(hotelUser));

        RoomChargeResponse response = new RoomChargeResponse();
        response.setId(19L);
        response.setHotelId(77L);
        response.setReservationId(55L);
        response.setIsPaid(true);

        when(roomChargeService.markChargeAsPaid(77L, 19L, "PAY-001")).thenReturn(response);
        when(roomChargeService.markChargeAsUnpaid(77L, 19L)).thenReturn(response);

        ResponseEntity<RoomChargeResponse> paidResponse = roomChargeController
                .markChargeAsPaid(19L, "PAY-001", authentication);
        ResponseEntity<RoomChargeResponse> unpaidResponse = roomChargeController
                .markChargeAsUnpaid(19L, authentication);
        ResponseEntity<Void> deleteResponse = roomChargeController.deleteRoomCharge(19L, authentication);

        assertEquals(HttpStatus.OK, paidResponse.getStatusCode());
        assertEquals(HttpStatus.OK, unpaidResponse.getStatusCode());
        assertEquals(HttpStatus.NO_CONTENT, deleteResponse.getStatusCode());
        assertNotNull(paidResponse.getBody());
        assertNotNull(unpaidResponse.getBody());

        verify(roomChargeService).markChargeAsPaid(77L, 19L, "PAY-001");
        verify(roomChargeService).markChargeAsUnpaid(77L, 19L);
        verify(roomChargeService).deleteRoomCharge(77L, 19L);
    }

        @Test
        void createRoomChargeShouldUseAuthenticatedUserEmailAndHotelId() {
                when(authentication.getName()).thenReturn("frontdesk@example.com");
                when(userRepository.findByEmail("frontdesk@example.com")).thenReturn(Optional.of(hotelUser));

                RoomChargeCreateRequest request = new RoomChargeCreateRequest();
                request.setReservationId(55L);
                request.setDescription("Late checkout fee");
                request.setAmount(new BigDecimal("30.00"));
                request.setChargeType(RoomChargeType.OTHER);

                RoomChargeResponse response = new RoomChargeResponse();
                response.setId(31L);
                response.setHotelId(77L);
                response.setReservationId(55L);
                response.setDescription("Late checkout fee");
                response.setAmount(new BigDecimal("30.00"));

                when(roomChargeService.createRoomCharge(request, "frontdesk@example.com", 77L)).thenReturn(response);

                ResponseEntity<RoomChargeResponse> createResponse = roomChargeController.createRoomCharge(request,
                                authentication);

                assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
                assertNotNull(createResponse.getBody());
                assertEquals(31L, createResponse.getBody().getId());
                verify(roomChargeService).createRoomCharge(request, "frontdesk@example.com", 77L);
        }

        @Test
        void hotelScopedListingEndpointsShouldUseProvidedHotelIdAndPaging() {
                RoomChargeResponse response = new RoomChargeResponse();
                response.setId(41L);
                response.setHotelId(77L);
                response.setDescription("Laundry service");

                Page<RoomChargeResponse> page = new PageImpl<>(List.of(response), PageRequest.of(2, 5), 1);

                when(roomChargeService.getRoomChargesForHotel(eq(77L), any())).thenReturn(page);
                when(roomChargeService.searchRoomCharges(eq(77L), eq("laundry"), any())).thenReturn(page);

                ResponseEntity<Page<RoomChargeResponse>> hotelResponse = roomChargeController.getRoomChargesForHotel(77L, 2,
                                5);
                ResponseEntity<Page<RoomChargeResponse>> searchResponse = roomChargeController.searchRoomCharges(77L,
                                "laundry", 2, 5);

                assertEquals(HttpStatus.OK, hotelResponse.getStatusCode());
                assertEquals(HttpStatus.OK, searchResponse.getStatusCode());
                assertNotNull(hotelResponse.getBody());
                assertNotNull(searchResponse.getBody());
                assertEquals(1, hotelResponse.getBody().getContent().size());
                assertEquals(1, searchResponse.getBody().getContent().size());

                verify(roomChargeService).getRoomChargesForHotel(77L, PageRequest.of(2, 5));
                verify(roomChargeService).searchRoomCharges(77L, "laundry", PageRequest.of(2, 5));
        }

        @Test
        void authenticatedEndpointsShouldReturnBadRequestWhenUserCannotBeResolved() {
                when(authentication.getName()).thenReturn("frontdesk@example.com");
                when(userRepository.findByEmail("frontdesk@example.com")).thenReturn(Optional.empty());

                ResponseEntity<List<RoomChargeResponse>> reservationResponse = roomChargeController
                                .getRoomChargesForReservation(55L, authentication);
                ResponseEntity<RoomChargeResponse> createResponse = roomChargeController.createRoomCharge(
                                new RoomChargeCreateRequest(55L, "Laundry", new BigDecimal("15.00"), RoomChargeType.OTHER),
                                authentication);

                assertEquals(HttpStatus.BAD_REQUEST, reservationResponse.getStatusCode());
                assertEquals(HttpStatus.BAD_REQUEST, createResponse.getStatusCode());
                verify(roomChargeService, never()).getRoomChargesForReservation(any(), any());
                verify(roomChargeService, never()).createRoomCharge(any(), any(), any());
        }
}