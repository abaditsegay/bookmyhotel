package com.bookmyhotel.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Embeddable guest information for reservations
 * Used for both registered users and anonymous guests
 */
@Embeddable
public class GuestInfo {
    
    @NotBlank(message = "Guest name is required")
    @Column(name = "guest_name", length = 100, nullable = true)
    private String name;
    
    @NotBlank(message = "Guest email is required")
    @Email(message = "Guest email must be valid")
    @Column(name = "guest_email", length = 100, nullable = false)
    private String email;
    
    @Column(name = "guest_phone", length = 20)
    private String phone;
    
    // Constructors
    public GuestInfo() {}
    
    public GuestInfo(String name, String email, String phone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
    }
    
    // Getters and setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
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
    
    @Override
    public String toString() {
        return "GuestInfo{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}
