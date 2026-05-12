package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.ShopOrderItemRequest;
import com.bookmyhotel.dto.ShopOrderRequest;
import com.bookmyhotel.dto.TaxBreakdown;
import com.bookmyhotel.dto.ShopOrderResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.PaymentMethod;
import com.bookmyhotel.entity.Product;
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
    void createOrderShouldPersistTaxInclusiveTotalAmount() {
        Hotel hotel = new Hotel();
        hotel.setId(8L);
        hotel.setName("Grand Plaza");
        hotel.setAddress("Main Street");

        Product product = new Product();
        product.setId(11L);
        product.setName("Water");
        product.setDescription("Mineral water");
        product.setSku("WATER-01");
        product.setPrice(new BigDecimal("10.00"));
        product.setStockQuantity(50);

        ShopOrderRequest request = new ShopOrderRequest();
        request.setCustomerName("Walk In");
        request.setPaymentMethod(PaymentMethod.CASH);
        request.setItems(List.of(new ShopOrderItemRequest(11L, 2)));
        request.setIsDelivery(false);

        when(hotelRepository.findById(8L)).thenReturn(Optional.of(hotel));
        when(productRepository.findById(11L)).thenReturn(Optional.of(product));
        when(shopOrderRepository.existsByHotelIdAndOrderNumber(eq(8L), any())).thenReturn(false);
        when(taxCalculationService.calculateTaxes(8L, new BigDecimal("20.00")))
                .thenReturn(new TaxBreakdown(new BigDecimal("3.00"), new BigDecimal("1.00"), BigDecimal.ZERO));
        when(hotelActivityAuditService.createSnapshot(any(Object[].class))).thenReturn(Map.of());
        when(shopOrderRepository.save(any(ShopOrder.class))).thenAnswer(invocation -> {
            ShopOrder order = invocation.getArgument(0);
            order.setId(101L);
            return order;
        });

        ShopOrderResponse response = shopOrderService.createOrder(8L, request);

        assertEquals(new BigDecimal("24.00"), response.getTotalAmount());
        assertEquals(new BigDecimal("4.00"), response.getTaxAmount());
    }

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