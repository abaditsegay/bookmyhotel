package com.bookmyhotel.exception;

/**
 * Exception thrown when a booking operation fails
 */
public class BookingException extends RuntimeException {
    
    public BookingException(String message) {
        super(message);
    }
    
    public BookingException(String message, Throwable cause) {
        super(message, cause);
    }
}
