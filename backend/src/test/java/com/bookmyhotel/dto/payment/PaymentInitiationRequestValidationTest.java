package com.bookmyhotel.dto.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class PaymentInitiationRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void shouldRejectAmountsWithMoreThanTwoDecimalPlaces() {
        PaymentInitiationRequest request = new PaymentInitiationRequest();
        request.setAmount(new BigDecimal("10.999"));
        request.setPhoneNumber("+251911223344");
        request.setBookingReference("BOOK-123");
        request.setPaymentProvider("MBIRR");

        Set<ConstraintViolation<PaymentInitiationRequest>> violations = validator.validate(request);

        assertEquals(1, violations.size());
        ConstraintViolation<PaymentInitiationRequest> violation = violations.iterator().next();
        assertEquals("amount", violation.getPropertyPath().toString());
        assertEquals("Amount must use at most 2 decimal places", violation.getMessage());
    }

    @Test
    void shouldAcceptAmountsWithTwoDecimalPlaces() {
        PaymentInitiationRequest request = new PaymentInitiationRequest();
        request.setAmount(new BigDecimal("10.99"));
        request.setPhoneNumber("+251911223344");
        request.setBookingReference("BOOK-123");
        request.setPaymentProvider("TELEBIRR");

        Set<ConstraintViolation<PaymentInitiationRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }
}