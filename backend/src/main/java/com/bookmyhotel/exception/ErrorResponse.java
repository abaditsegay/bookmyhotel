package com.bookmyhotel.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized error response structure for consistent API error handling
 */
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String details;
    private String path;
    private Map<String, String> fieldErrors;
    private String userFriendlyMessage;

    // Default constructor
    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    // Getters and Setters
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(Map<String, String> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    public String getUserFriendlyMessage() {
        return userFriendlyMessage;
    }

    public void setUserFriendlyMessage(String userFriendlyMessage) {
        this.userFriendlyMessage = userFriendlyMessage;
    }

    // Builder class
    public static class Builder {
        private ErrorResponse errorResponse;

        public Builder() {
            this.errorResponse = new ErrorResponse();
        }

        public Builder timestamp(LocalDateTime timestamp) {
            this.errorResponse.timestamp = timestamp;
            return this;
        }

        public Builder status(int status) {
            this.errorResponse.status = status;
            return this;
        }

        public Builder error(String error) {
            this.errorResponse.error = error;
            return this;
        }

        public Builder message(String message) {
            this.errorResponse.message = message;
            return this;
        }

        public Builder details(String details) {
            this.errorResponse.details = details;
            return this;
        }

        public Builder path(String path) {
            this.errorResponse.path = path;
            return this;
        }

        public Builder fieldErrors(Map<String, String> fieldErrors) {
            this.errorResponse.fieldErrors = fieldErrors;
            return this;
        }

        public Builder userFriendlyMessage(String userFriendlyMessage) {
            this.errorResponse.userFriendlyMessage = userFriendlyMessage;
            return this;
        }

        public ErrorResponse build() {
            return this.errorResponse;
        }
    }
}