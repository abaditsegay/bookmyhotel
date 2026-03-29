package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.ProductRequest;
import com.bookmyhotel.dto.ProductResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Product;
import com.bookmyhotel.entity.ProductCategory;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private HotelActivityAuditService hotelActivityAuditService;

    @InjectMocks
    private ProductService productService;

    @Test
    void shouldAuditProductCreation() {
        Hotel hotel = new Hotel();
        hotel.setId(3L);

        ProductRequest request = new ProductRequest();
        request.setName("Water Bottle");
        request.setDescription("Still water");
        request.setCategory(ProductCategory.BEVERAGES);
        request.setPrice(new BigDecimal("3.50"));
        request.setStockQuantity(15);
        request.setMinimumStockLevel(2);
        request.setSku("WTR-01");

        when(hotelRepository.findById(3L)).thenReturn(Optional.of(hotel));
        when(productRepository.existsByHotelIdAndSku(3L, "WTR-01")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product saved = invocation.getArgument(0);
            saved.setId(44L);
            return saved;
        });
        ProductResponse response = productService.createProduct(3L, request);

        assertEquals(44L, response.getId());
        assertEquals("Water Bottle", response.getName());
        verify(hotelActivityAuditService).logActivity(
                eq(hotel),
                eq("PRODUCT"),
                eq(44L),
                eq("CREATE"),
                eq(null),
                any(),
                any(),
                eq("Inventory product created"),
                eq(true),
                eq("FINANCIAL"));
    }

    @Test
    void shouldAuditStockUpdate() {
        Hotel hotel = new Hotel();
        hotel.setId(5L);

        Product product = new Product();
        product.setId(71L);
        product.setHotel(hotel);
        product.setName("Snack");
        product.setCategory(ProductCategory.SNACKS);
        product.setPrice(new BigDecimal("2.00"));
        product.setStockQuantity(8);
        product.setMinimumStockLevel(1);

        when(productRepository.findById(71L)).thenReturn(Optional.of(product));
        when(productRepository.save(product)).thenReturn(product);
        ProductResponse response = productService.updateStock(5L, 71L, 12);

        assertEquals(12, response.getStockQuantity());
        verify(hotelActivityAuditService).logActivity(
                eq(hotel),
                eq("PRODUCT"),
                eq(71L),
                eq("STOCK_UPDATE"),
                any(),
                any(),
                any(),
                eq("Inventory stock quantity updated"),
                eq(true),
                eq("FINANCIAL"));
    }
}