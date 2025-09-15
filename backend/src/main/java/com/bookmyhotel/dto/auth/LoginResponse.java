package com.bookmyhotel.dto.auth;

import java.util.Set;

import com.bookmyhotel.entity.UserRole;

/**
 * Login response DTO
 */
public class LoginResponse {

    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Set<UserRole> roles;
    private Long hotelId;
    private String hotelName;
    private String tenantId;

    // Constructors
    public LoginResponse() {
    }

    public LoginResponse(String token, Long id, String email, String firstName, String lastName, Set<UserRole> roles) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roles = roles;
    }

    public LoginResponse(String token, Long id, String email, String firstName, String lastName, Set<UserRole> roles,
            Long hotelId, String hotelName) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roles = roles;
        this.hotelId = hotelId;
        this.hotelName = hotelName;
    }

    public LoginResponse(String token, Long id, String email, String firstName, String lastName, Set<UserRole> roles,
            Long hotelId, String hotelName, String tenantId) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roles = roles;
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.tenantId = tenantId;
    }

    public LoginResponse(String token, String refreshToken, Long id, String email, String firstName, String lastName,
            Set<UserRole> roles, Long hotelId, String hotelName, String tenantId) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roles = roles;
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.tenantId = tenantId;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}
