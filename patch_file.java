    @PostMapping("/cancel")
    public ResponseEntity<BookingModificationResponse> cancelBooking(
            @Valid @RequestBody BookingCancellationRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {

        authRateLimitService.checkBookingCancellationAllowed(httpRequest.getRemoteAddr());

        BookingModificationResponse response = bookingService.cancelBooking(request);
