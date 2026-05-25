package com.bookmyhotel.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.FilterChain;

class RequestCorrelationFilterTest {

    @Test
    void shouldGenerateAndExposeRequestIdAndCleanMdcAfterRequest() throws Exception {
        RequestCorrelationFilter filter = new RequestCorrelationFilter();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain chain = (req, res) -> {
            String requestId = MDC.get(RequestCorrelationFilter.REQUEST_ID_KEY);
            assertNotNull(requestId);
            assertEquals(requestId, ((MockHttpServletResponse) res).getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER));
        };

        filter.doFilter(request, response, chain);

        assertNull(MDC.get(RequestCorrelationFilter.REQUEST_ID_KEY));
        assertNotNull(response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER));
    }
}