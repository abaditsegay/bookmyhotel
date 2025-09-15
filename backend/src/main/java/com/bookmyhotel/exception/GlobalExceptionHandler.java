package com.bookmyhotel.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

/**
 * Enhanced global exception handler for consistent, user-friendly error
 * responses
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle validation errors from @Valid annotations with enhanced user-friendly
     * responses
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Please check the provided information and try again")
                .details("One or more fields contain invalid data")
                .path(getPath(request))
                .fieldErrors(fieldErrors)
                .userFriendlyMessage("Please correct the highlighted fields and submit again")
                .build();

        logger.warn("Validation error for request {}: {}", getPath(request), fieldErrors);

        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle authentication exceptions with user-friendly messages
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Authentication Failed")
                .message("Invalid credentials or authentication required")
                .details(ex.getMessage())
                .path(getPath(request))
                .userFriendlyMessage("Please check your login credentials and try again")
                .build();

        logger.warn("Authentication error for request {}: {}", getPath(request), ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle bad credentials with specific user guidance
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {

        String userMessage;
        if (ex.getMessage().contains("Account is disabled") || ex.getMessage().contains("Account is deactivated")) {
            userMessage = "Your account has been deactivated. Please contact support for assistance.";
        } else {
            userMessage = "The email or password you entered is incorrect. Please try again.";
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Login Failed")
                .message("Authentication failed")
                .details("Invalid credentials provided")
                .path(getPath(request))
                .userFriendlyMessage(userMessage)
                .build();

        logger.warn("Bad credentials for request {}: {}", getPath(request), ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle access denied exceptions
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("Access Denied")
                .message("You don't have permission to access this resource")
                .details("Insufficient privileges for the requested operation")
                .path(getPath(request))
                .userFriendlyMessage(
                        "You don't have permission to perform this action. Please contact your administrator if you believe this is an error.")
                .build();

        logger.warn("Access denied for request {}: {}", getPath(request), ex.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * Handle resource not found exceptions
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Resource Not Found")
                .message("The requested resource could not be found")
                .details(ex.getMessage())
                .path(getPath(request))
                .userFriendlyMessage("The item you're looking for doesn't exist or may have been removed.")
                .build();

        logger.warn("Resource not found for request {}: {}", getPath(request), ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Handle booking exceptions
     */
    @ExceptionHandler(BookingException.class)
    public ResponseEntity<ErrorResponse> handleBookingException(
            BookingException ex, WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Booking Error")
                .message("There was an issue with your booking request")
                .details(ex.getMessage())
                .path(getPath(request))
                .userFriendlyMessage("We couldn't process your booking. Please check the details and try again.")
                .build();

        logger.warn("Booking error for request {}: {}", getPath(request), ex.getMessage());

        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle resource already exists exceptions
     */
    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleResourceAlreadyExistsException(
            ResourceAlreadyExistsException ex, WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Resource Already Exists")
                .message("A resource with the same information already exists")
                .details(ex.getMessage())
                .path(getPath(request))
                .userFriendlyMessage("This information is already in use. Please try with different details.")
                .build();

        logger.warn("Resource conflict for request {}: {}", getPath(request), ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Invalid Request")
                .message("The request contains invalid data")
                .details(ex.getMessage())
                .path(getPath(request))
                .userFriendlyMessage("Please check your input and try again.")
                .build();

        logger.warn("Illegal argument for request {}: {}", getPath(request), ex.getMessage());

        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle method not supported exceptions
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex, WebRequest request) {

        String supportedMethods = ex.getSupportedHttpMethods() != null
                ? ex.getSupportedHttpMethods().stream()
                        .map(Object::toString)
                        .collect(Collectors.joining(", "))
                : "Unknown";

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.METHOD_NOT_ALLOWED.value())
                .error("Method Not Allowed")
                .message("The requested HTTP method is not supported for this endpoint")
                .details("Supported methods: " + supportedMethods)
                .path(getPath(request))
                .userFriendlyMessage("This operation is not supported. Please try a different action.")
                .build();

        logger.warn("Method not supported for request {}: {} (supported: {})",
                getPath(request), ex.getMethod(), supportedMethods);

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(errorResponse);
    }

    /**
     * Handle constraint violation exceptions
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex, WebRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            fieldErrors.put(fieldName, errorMessage);
        }

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Constraint Violation")
                .message("Data validation failed")
                .details("One or more constraints were violated")
                .path(getPath(request))
                .fieldErrors(fieldErrors)
                .userFriendlyMessage("Please ensure all fields meet the required criteria")
                .build();

        logger.warn("Constraint violation for request {}: {}", getPath(request), fieldErrors);

        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle all other unexpected exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred while processing your request")
                .details("Please try again later or contact support if the problem persists")
                .path(getPath(request))
                .userFriendlyMessage("We're experiencing technical difficulties. Please try again in a few moments.")
                .build();

        logger.error("Unexpected error for request {}: ", getPath(request), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * Extract request path from WebRequest
     */
    private String getPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }
}
