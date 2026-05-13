package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.HotelSearchRequest;
import com.bookmyhotel.dto.HotelSearchResult;
import com.bookmyhotel.dto.RoomTypeAvailabilityDto;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelImage;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.RoomTypePricing;
import com.bookmyhotel.enums.ImageCategory;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomRepository;

@ExtendWith(MockitoExtension.class)
class HotelSearchServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomCacheService roomCacheService;

    @Mock
    private RoomTypePricingService roomTypePricingService;

    @Mock
    private HotelImageService hotelImageService;

    @InjectMocks
    private HotelSearchService hotelSearchService;

    @Test
    void searchHotelsShouldIgnoreInvalidRoomTypeFilter() {
        HotelSearchRequest request = request();
        request.setRoomType("not-a-real-room-type");
        when(hotelRepository.findAvailableHotels(
                request.getLocation(),
                request.getCheckInDate(),
                request.getCheckOutDate(),
                request.getGuests(),
                null,
                request.getMinPrice(),
                request.getMaxPrice())).thenReturn(List.of());

        List<HotelSearchResult> results = hotelSearchService.searchHotels(request);

        assertEquals(0, results.size());
        verify(hotelRepository).findAvailableHotels(
                request.getLocation(),
                request.getCheckInDate(),
                request.getCheckOutDate(),
                request.getGuests(),
                null,
                request.getMinPrice(),
                request.getMaxPrice());
    }

    @Test
    void getAvailableRoomsShouldFilterByPriceUsingFallbackStaticRoomPrice() {
        Hotel hotel = hotel(1L);
        Room included = room(hotel, 10L, "101", RoomType.STANDARD, "120.00", 2, "Standard room");
        Room excluded = room(hotel, 11L, "102", RoomType.DELUXE, "250.00", 3, "Deluxe room");
        HotelSearchRequest request = request();
        request.setMinPrice(100.0);
        request.setMaxPrice(150.0);

        when(roomCacheService.findAvailableRooms(1L, request.getCheckInDate(), request.getCheckOutDate(), request.getGuests(), null))
                .thenReturn(List.of(included, excluded));
        when(roomTypePricingService.getRoomTypePricing(1L, RoomType.STANDARD)).thenThrow(new RuntimeException("missing config"));
        when(roomTypePricingService.getRoomTypePricing(1L, RoomType.DELUXE)).thenThrow(new RuntimeException("missing config"));

        List<HotelSearchResult.AvailableRoomDto> rooms = hotelSearchService.getAvailableRooms(1L, request);

        assertEquals(1, rooms.size());
        assertEquals("101", rooms.getFirst().getRoomNumber());
        assertEquals(new BigDecimal("120.00"), rooms.getFirst().getPricePerNight());
    }

    @Test
    void getRoomTypeAvailabilityShouldUseConfiguredPricingAndSwallowImageFailures() {
        Hotel hotel = hotel(1L);
        Room sampleRoom = room(hotel, 20L, "201", RoomType.DELUXE, "180.00", 3, "Balcony suite");
        RoomTypePricing pricing = new RoomTypePricing();
        pricing.setRoomType(RoomType.DELUXE);
        pricing.setBasePricePerNight(new BigDecimal("210.00"));
        HotelSearchRequest request = request();

        when(roomCacheService.findDistinctRoomTypesByHotel(1L)).thenReturn(List.of(RoomType.DELUXE, RoomType.SUITE));
        when(roomCacheService.countAvailableRoomsByType(1L, RoomType.DELUXE, request.getCheckInDate(), request.getCheckOutDate(), request.getGuests()))
                .thenReturn(2L);
        when(roomCacheService.countAvailableRoomsByType(1L, RoomType.SUITE, request.getCheckInDate(), request.getCheckOutDate(), request.getGuests()))
                .thenReturn(0L);
        when(roomRepository.countTotalRoomsByType(1L, RoomType.DELUXE)).thenReturn(5L);
        when(roomRepository.countTotalRoomsByType(1L, RoomType.SUITE)).thenReturn(1L);
        when(roomCacheService.findAvailableRooms(1L, request.getCheckInDate(), request.getCheckOutDate(), request.getGuests(), RoomType.DELUXE))
                .thenReturn(List.of(sampleRoom));
        when(roomCacheService.findAvailableRooms(1L, request.getCheckInDate(), request.getCheckOutDate(), request.getGuests(), RoomType.SUITE))
                .thenReturn(List.of());
        when(roomRepository.findByHotelIdAndRoomType(1L, RoomType.SUITE)).thenReturn(List.of());
        when(roomTypePricingService.getRoomTypePricing(1L, RoomType.DELUXE)).thenReturn(pricing);
        when(roomTypePricingService.getRoomTypePricing(1L, RoomType.SUITE)).thenThrow(new RuntimeException("missing config"));
        when(hotelImageService.getRoomTypeHeroImagePublic(1L, (long) (RoomType.DELUXE.ordinal() + 1)))
                .thenThrow(new RuntimeException("s3 unavailable"));

        List<RoomTypeAvailabilityDto> availability = hotelSearchService.getRoomTypeAvailability(1L, request);

        assertEquals(1, availability.size());
        RoomTypeAvailabilityDto dto = availability.getFirst();
        assertEquals(RoomType.DELUXE, dto.getRoomType());
        assertEquals(2, dto.getAvailableCount());
        assertEquals(5, dto.getTotalCount());
        assertEquals(new BigDecimal("210.00"), dto.getPricePerNight());
        assertEquals("Balcony suite", dto.getDescription());
        assertNull(dto.getImageUrl());
    }

    @Test
    void getHotelDetailsShouldMapImagesAndPriceRangeFromRoomTypeAvailability() {
        Hotel hotel = hotel(5L);
        hotel.setDescription("Central business hotel");
        hotel.setAddress("Bole Road");
        hotel.setCity("Addis Ababa");
        hotel.setCountry("Ethiopia");
        hotel.setPhone("+251900000000");
        hotel.setEmail("hello@hotel.test");
        hotel.setWebsiteUrl("https://hotel.test");
        hotel.setFacilityAmenities("WiFi,Spa");
        hotel.setNumberOfRooms(80);
        hotel.setCheckInTime("14:00");
        hotel.setCheckOutTime("11:00");
        hotel.setMobilePaymentPhone("0911000000");
        hotel.setMobilePaymentPhone2("0922000000");

        HotelImage hero = hotelImage(1L, ImageCategory.HOTEL_HERO, "https://cdn.test/hero.jpg");
        HotelImage gallery = hotelImage(2L, ImageCategory.HOTEL_GALLERY, "https://cdn.test/gallery.jpg");
        HotelSearchRequest request = request();

        when(hotelRepository.findByIdAndIsPubliclyListedTrue(5L)).thenReturn(Optional.of(hotel));
        when(hotelImageService.getHotelHeroImagePublic(5L)).thenReturn(Optional.of(hero));
        when(hotelImageService.getHotelImagesPublic(5L)).thenReturn(List.of(hero, gallery));
        when(roomCacheService.findDistinctRoomTypesByHotel(5L)).thenReturn(List.of(RoomType.STANDARD, RoomType.SUITE));
        stubRoomTypeAvailability(5L, request, RoomType.STANDARD, room(hotel, 30L, "301", RoomType.STANDARD, "100.00", 2, "Standard"), 4L, 10L, new BigDecimal("120.00"));
        stubRoomTypeAvailability(5L, request, RoomType.SUITE, room(hotel, 31L, "401", RoomType.SUITE, "250.00", 4, "Suite"), 1L, 2L, new BigDecimal("275.00"));
        when(hotelImageService.getRoomTypeHeroImagePublic(5L, (long) (RoomType.STANDARD.ordinal() + 1))).thenReturn(Optional.empty());
        when(hotelImageService.getRoomTypeHeroImagePublic(5L, (long) (RoomType.SUITE.ordinal() + 1))).thenReturn(Optional.empty());

        HotelSearchResult result = hotelSearchService.getHotelDetails(5L, request);

        assertEquals(5L, result.getId());
        assertEquals("https://cdn.test/hero.jpg", result.getHeroImageUrl());
        assertEquals(List.of("https://cdn.test/gallery.jpg"), result.getGalleryImageUrls());
        assertEquals(new BigDecimal("120.00"), result.getMinPrice());
        assertEquals(new BigDecimal("275.00"), result.getMaxPrice());
        assertEquals(2, result.getRoomTypeAvailability().size());
    }

    @Test
    void getHotelDetailsShouldThrowForUnknownHotel() {
        when(hotelRepository.findByIdAndIsPubliclyListedTrue(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> hotelSearchService.getHotelDetails(99L, request()));

        assertEquals("Hotel not found or not publicly listed", exception.getMessage());
    }

    private void stubRoomTypeAvailability(Long hotelId, HotelSearchRequest request, RoomType roomType,
            Room sampleRoom, long availableCount, long totalCount, BigDecimal configuredPrice) {
        RoomTypePricing pricing = new RoomTypePricing();
        pricing.setRoomType(roomType);
        pricing.setBasePricePerNight(configuredPrice);

        when(roomCacheService.countAvailableRoomsByType(hotelId, roomType, request.getCheckInDate(), request.getCheckOutDate(), request.getGuests()))
                .thenReturn(availableCount);
        when(roomRepository.countTotalRoomsByType(hotelId, roomType)).thenReturn(totalCount);
        when(roomCacheService.findAvailableRooms(hotelId, request.getCheckInDate(), request.getCheckOutDate(), request.getGuests(), roomType))
                .thenReturn(List.of(sampleRoom));
        when(roomTypePricingService.getRoomTypePricing(hotelId, roomType)).thenReturn(pricing);
    }

    private HotelSearchRequest request() {
        HotelSearchRequest request = new HotelSearchRequest();
        request.setLocation("Addis Ababa");
        request.setCheckInDate(LocalDate.of(2026, 6, 10));
        request.setCheckOutDate(LocalDate.of(2026, 6, 12));
        request.setGuests(2);
        return request;
    }

    private Room room(Hotel hotel, Long id, String roomNumber, RoomType roomType, String price, int capacity, String description) {
        Room room = new Room();
        room.setId(id);
        room.setHotel(hotel);
        room.setRoomNumber(roomNumber);
        room.setRoomType(roomType);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setPricePerNight(new BigDecimal(price));
        room.setCapacity(capacity);
        room.setDescription(description);
        return room;
    }

    private HotelImage hotelImage(Long id, ImageCategory category, String path) {
        HotelImage hotelImage = new HotelImage();
        hotelImage.setId(id);
        hotelImage.setImageCategory(category);
        hotelImage.setFilePath(path);
        hotelImage.setFileName("image-" + id + ".jpg");
        hotelImage.setTenantId("default");
        hotelImage.setHotelId(1L);
        return hotelImage;
    }

    private Hotel hotel(Long id) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName("Hotel " + id);
        return hotel;
    }
}