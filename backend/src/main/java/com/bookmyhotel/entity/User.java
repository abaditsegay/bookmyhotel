package com.bookmyhotel.entity;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.bookmyhotel.tenant.TenantContext;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * User entity for authentication and authorization
 * Supports both tenant-bound users (HOTEL_ADMIN, FRONTDESK, etc.)
 * and system-wide users (CUSTOMER, ADMIN)
 * CUSTOMER: Registered users with accounts
 * GUEST: Anonymous users (don't have User records)
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_tenant", columnList = "tenant_id"),
        @Index(name = "idx_user_email", columnList = "email", unique = true)
})
public class User extends BaseEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tenant ID - nullable for system-wide users (GUEST, ADMIN)
    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<UserRole> roles;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    // Constructors
    public User() {
    }

    public User(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Lifecycle methods for tenant management
    @PrePersist
    public void prePersist() {
        super.prePersist(); // Call BaseEntity's prePersist first
        System.err.println("🚨🚨🚨 USER PRE_PERSIST: STARTING prePersist() method 🚨🚨🚨");
        System.err.println("🚨🚨🚨 USER PRE_PERSIST: User email = " + this.email + " 🚨🚨🚨");
        System.err.println("🚨🚨🚨 USER PRE_PERSIST: User roles = " + this.roles + " 🚨🚨🚨");
        System.err.println("🚨🚨🚨 USER PRE_PERSIST: Current tenant_id before logic = " + this.tenantId + " 🚨🚨🚨");
        System.err.println(
                "🚨🚨🚨 USER PRE_PERSIST: TenantContext.getTenantId() = " + TenantContext.getTenantId() + " 🚨🚨🚨");

        if (isTenantBoundUser()) {
            // Only set tenant ID from context if not explicitly set
            // This prevents overriding explicitly assigned tenant IDs during user creation
            if (this.tenantId == null || this.tenantId.trim().isEmpty()) {
                String contextTenantId = TenantContext.getTenantId();
                if (contextTenantId != null && !contextTenantId.trim().isEmpty()) {
                    System.err.println(
                            "🚨🚨🚨 USER PRE_PERSIST: User is TENANT BOUND, setting tenant ID from context 🚨🚨🚨");
                    this.tenantId = contextTenantId;
                } else {
                    System.err.println(
                            "🚨🚨🚨 USER PRE_PERSIST: User is TENANT BOUND but no context tenant available 🚨🚨🚨");
                }
            } else {
                System.err.println(
                        "🚨🚨🚨 USER PRE_PERSIST: User is TENANT BOUND but tenant_id already explicitly set, preserving it 🚨🚨🚨");
            }
        } else {
            System.err.println(
                    "🚨🚨🚨 USER PRE_PERSIST: User is NOT tenant bound (guest/admin), keeping tenant_id as null 🚨🚨🚨");
            // Explicitly set to null for guest users
            this.tenantId = null;
        }
        System.err.println("🚨🚨🚨 USER PRE_PERSIST: Final tenant_id = " + this.tenantId + " 🚨🚨🚨");
        System.err.println("🚨🚨🚨 USER PRE_PERSIST: ENDING prePersist() method 🚨🚨🚨");
    }

    @PreUpdate
    public void preUpdate() {
        super.preUpdate(); // Call BaseEntity's preUpdate
    }

    /**
     * Determines if this user should be bound to a tenant
     * GUEST and ADMIN users are system-wide (not tenant-bound)
     * All other roles are tenant-bound
     */
    public boolean isTenantBoundUser() {
        // Check if user has system-wide roles (GUEST or ADMIN)
        if (roles != null) {
            return !roles.contains(UserRole.CUSTOMER) && !roles.contains(UserRole.ADMIN);
        }
        return false; // If no roles, not tenant-bound
    }

    /**
     * Checks if this user is a system-wide user (not bound to any tenant)
     */
    public boolean isSystemWideUser() {
        return this.tenantId == null;
    }

    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles;
    }

    public Hotel getHotel() {
        return hotel;
    }

    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }
}
