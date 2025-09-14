package com.bookmyhotel.event;

import org.springframework.context.ApplicationEvent;

/**
 * Event fired when a reservation operation affects room availability
 */
public class ReservationAvailabilityChangedEvent extends ApplicationEvent {

    private final Long hotelId;
    private final String operation; // "CREATE", "UPDATE", "CANCEL"
    private final Long reservationId;

    public ReservationAvailabilityChangedEvent(Object source, Long hotelId, String operation, Long reservationId) {
        super(source);
        this.hotelId = hotelId;
        this.operation = operation;
        this.reservationId = reservationId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public String getOperation() {
        return operation;
    }

    public Long getReservationId() {
        return reservationId;
    }
}
