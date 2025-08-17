package com.bookmyhotel.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Hotel search result DTO
 */
public class HotelSearchResult {
    
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String country;
    private String phone;
    private String email;
    private List<AvailableRoomDto> availableRooms;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    
    // Constructors
    public HotelSearchResult() {}
    
    public HotelSearchResult(Long id, String name, String address, String city, String country) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.city = city;
        this.country = country;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public List<AvailableRoomDto> getAvailableRooms() {
        return availableRooms;
    }
    
    public void setAvailableRooms(List<AvailableRoomDto> availableRooms) {
        this.availableRooms = availableRooms;
    }
    
    public BigDecimal getMinPrice() {
        return minPrice;
    }
    
    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }
    
    public BigDecimal getMaxPrice() {
        return maxPrice;
    }
    
    public void setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
    }
    
    /**
     * Available room DTO for search results
     */
    public static class AvailableRoomDto {
        private Long id;
        private String roomNumber;
        private String roomType;
        private BigDecimal pricePerNight;
        private Integer capacity;
        private String description;
        
        // Constructors
        public AvailableRoomDto() {}
        
        public AvailableRoomDto(Long id, String roomNumber, String roomType, BigDecimal pricePerNight, Integer capacity) {
            this.id = id;
            this.roomNumber = roomNumber;
            this.roomType = roomType;
            this.pricePerNight = pricePerNight;
            this.capacity = capacity;
        }
        
        // Getters and Setters
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getRoomNumber() {
            return roomNumber;
        }
        
        public void setRoomNumber(String roomNumber) {
            this.roomNumber = roomNumber;
        }
        
        public String getRoomType() {
            return roomType;
        }
        
        public void setRoomType(String roomType) {
            this.roomType = roomType;
        }
        
        public BigDecimal getPricePerNight() {
            return pricePerNight;
        }
        
        public void setPricePerNight(BigDecimal pricePerNight) {
            this.pricePerNight = pricePerNight;
        }
        
        public Integer getCapacity() {
            return capacity;
        }
        
        public void setCapacity(Integer capacity) {
            this.capacity = capacity;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
    }
}
