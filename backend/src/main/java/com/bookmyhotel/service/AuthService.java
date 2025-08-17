package com.bookmyhotel.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bookmyhotel.dto.auth.LoginRequest;
import com.bookmyhotel.dto.auth.LoginResponse;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.util.JwtUtil;

/**
 * Authentication service for user login and token management
 */
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Authenticate user and generate JWT token
     */
    public LoginResponse login(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOpt.isEmpty()) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        User user = userOpt.get();
        
        if (!user.getIsActive()) {
            throw new BadCredentialsException("Account is deactivated");
        }
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        String token = jwtUtil.generateToken(user);
        
        // Include hotel information if user is associated with a hotel
        Long hotelId = null;
        String hotelName = null;
        if (user.getHotel() != null) {
            hotelId = user.getHotel().getId();
            hotelName = user.getHotel().getName();
        }
        
        return new LoginResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRoles(),
            hotelId,
            hotelName
        );
    }
    
    /**
     * Validate JWT token and return user details
     */
    public User validateToken(String token) {
        String email = jwtUtil.extractEmail(token);
        
        if (email != null && jwtUtil.isTokenValid(token)) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent() && userOpt.get().getIsActive()) {
                return userOpt.get();
            }
        }
        
        return null;
    }
}
