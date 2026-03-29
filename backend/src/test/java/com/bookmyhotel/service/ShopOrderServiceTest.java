package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.ShopOrderResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.ShopOrder;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ProductRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.ShopOrderRepository;

@ExtendWith(MockitoExtension.class)
class ShopOrderServiceTest {

    @Mock
    private ShopOrderRepository shopOrderRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RoomChargeService roomChargeService;

    @Mock
    private HotelPricingConfigService hotelPricingConfigService;

    @Mock
    private TaxCalculationService taxCalculationService;

    @Mock
    private HotelActivityAuditService hotelActivityAuditService;

    @InjectMocks
    private ShopOrderService shopOrderService;

    @Test
    void shouldAuditOrderStatusUpdate() {
        Hotel hotel = new Hotel();
        hotel.setId(8L);
        hotel.setName("Grand Plaza");
        hotel.setAddress("Main Street");

        ShopOrder order = new ShopOrder();
        order.setId(101L);
        order.setHotel(hotel);
        order.setOrderNumber("ORD-8-100101");
        order.setStatus(OrderStatus.PENDING);
        order.setIsPaid(false);
        order.setTotalAmount(new BigDecimal("19.99"));
        order.setTaxAmount(new BigDecimal("2.00"));
        order.setVatAmount(new BigDecimal("1.50"));
        order.setServiceTaxAmount(new BigDecimal("0.50"));
        order.setOrderItems(new ArrayList<>());

        when(shopOrderRepository.findByIdAndHotelId(101L, 8L)).thenReturn(Optional.of(order));
        when(shopOrderRepository.save(order)).thenReturn(order);
        ShopOrderResponse response = shopOrderService.updateOrderStatus(8L, 101L, OrderStatus.PAID);

        assertEquals(OrderStatus.PAID, response.getStatus());
        verify(hotelActivityAuditService).logActivity(
                eq(hotel),
                eq("SHOP_ORDER"),
                eq(101L),
                eq("STATUS_CHANGE"),
                any(),
                any(),
                any(),
                eq("Shop order status updated"),
                eq(true),
                eq("FINANCIAL"));
    }
}