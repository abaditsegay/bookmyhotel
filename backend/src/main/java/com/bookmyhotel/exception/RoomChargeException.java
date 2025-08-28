package com.bookmyhotel.exception;

/**
 * Exception for room charge related errors
 */
public class RoomChargeException extends RuntimeException {

    public RoomChargeException(String message) {
        super(message);
    }

    public RoomChargeException(String message, Throwable cause) {
        super(message, cause);
    }
}
