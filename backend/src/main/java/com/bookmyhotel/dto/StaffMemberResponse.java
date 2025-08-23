package com.bookmyhotel.dto;

import java.util.Set;

import com.bookmyhotel.entity.UserRole;

/**
 * Response DTO for staff member information used in scheduling
 */
public class StaffMemberResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Long hotelId;
    private String hotelName;
    private Set<UserRole> roles;

    // Constructors
    public StaffMemberResponse() {}

    public StaffMemberResponse(Long id, String firstName, String lastName, String email, 
                              String phone, Long hotelId, String hotelName, Set<UserRole> roles) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.roles = roles;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
