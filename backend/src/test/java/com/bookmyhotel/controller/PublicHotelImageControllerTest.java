package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelImage;
import com.bookmyhotel.enums.ImageCategory;
import com.bookmyhotel.service.HotelImageService;
import com.bookmyhotel.service.HotelService;

@ExtendWith(MockitoExtension.class)
class PublicHotelImageControllerTest {

    @Mock
    private HotelImageService hotelImageService;

    @Mock
    private HotelService hotelService;

    @InjectMocks
    private PublicHotelImageController controller;

    @Test
    void getHotelImagesShouldReturnNotFoundForNonPublicHotel() {
        when(hotelService.getHotelById(10L)).thenReturn(Optional.of(hotel(false)));

        ResponseEntity<Map<String, Object>> response = controller.getHotelImages(10L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verifyNoInteractions(hotelImageService);
    }

    @Test
    void getHotelImagesShouldReturnImagesForPublicHotel() {
        HotelImage image = new HotelImage();
        image.setId(22L);
        image.setHotelId(10L);
        image.setFileName("hero.jpg");
        image.setFilePath("/images/hero.jpg");
        image.setImageCategory(ImageCategory.HOTEL_HERO);

        when(hotelService.getHotelById(10L)).thenReturn(Optional.of(hotel(true)));
        when(hotelImageService.getHotelImagesPublic(10L)).thenReturn(List.of(image));

        ResponseEntity<Map<String, Object>> response = controller.getHotelImages(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(true, body.get("success"));
        assertEquals(1, body.get("total"));
        verify(hotelImageService).getHotelImagesPublic(10L);
    }

    private Hotel hotel(boolean publiclyListed) {
        Hotel hotel = new Hotel();
        hotel.setId(10L);
        hotel.setIsActive(true);
        hotel.setIsPubliclyListed(publiclyListed);
        return hotel;
    }
}