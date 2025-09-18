package com.bookmyhotel.controller;

import com.bookmyhotel.service.AutoCheckoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for manual auto-checkout testing
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AutoCheckoutController {

    @Autowired
    private AutoCheckoutService autoCheckoutService;

    /**
     * Manual trigger for auto-checkout (for testing)
     */
    @PostMapping("/auto-checkout")
    public ResponseEntity<Map<String, Object>> manualAutoCheckout() {
        try {
            int checkedOutCount = autoCheckoutService.manualAutoCheckout();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Auto-checkout completed successfully");
            response.put("checkedOutCount", checkedOutCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Auto-checkout failed: " + e.getMessage());
            response.put("checkedOutCount", 0);
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
