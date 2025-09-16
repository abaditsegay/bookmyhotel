package com.bookmyhotel.config;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

/**
 * CORS Controller to handle preflight requests for mobile browsers
 */
// @RestController - DISABLED to fix CORS conflicts
// @CrossOrigin(origins = "*", maxAge = 3600, allowedHeaders = { "Origin", "Content-Type", "Accept", "Authorization",
//         "X-Tenant-ID", "X-Requested-With" }, methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
//                 RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.HEAD })
public class CorsController {

    /**
     * Handle OPTIONS requests for CORS preflight - DISABLED
     * CORS is now handled centrally by SecurityConfig.corsConfigurationSource()
     */
    // @RequestMapping(method = RequestMethod.OPTIONS, value = "/**")
    public void handleOptions(HttpServletResponse response) {
        // DISABLED - SecurityConfig handles CORS to avoid duplicate headers
        // Set CORS headers explicitly for mobile browsers
        // response.setHeader("Access-Control-Allow-Origin", "*");
        // response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH");
        // response.setHeader("Access-Control-Allow-Headers",
        //         "Origin, Content-Type, Accept, Authorization, X-Tenant-ID, X-Requested-With");
        // response.setHeader("Access-Control-Max-Age", "7200");
        // response.setHeader("Access-Control-Allow-Credentials", "true");
        // response.setStatus(HttpServletResponse.SC_OK);
    }
}
