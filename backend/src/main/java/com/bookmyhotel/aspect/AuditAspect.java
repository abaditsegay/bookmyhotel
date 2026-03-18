package com.bookmyhotel.aspect;

import com.bookmyhotel.annotation.Auditable;
import com.bookmyhotel.service.SystemAuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Aspect
@Component
public class AuditAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditAspect.class);

    @Autowired
    private SystemAuditService auditService;

    @Around("@annotation(com.bookmyhotel.annotation.Auditable)")
    public Object audit(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature sig = (MethodSignature) pjp.getSignature();
        Method method = sig.getMethod();
        Auditable auditable = method.getAnnotation(Auditable.class);

        // Extract security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        String userName = "system";
        String userEmail = null;
        String userRole = null;

        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetails ud) {
            userName = ud.getUsername();
            userEmail = ud.getUsername();
            userRole = ud.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring(5))
                    .findFirst()
                    .orElse(null);
        }

        // Extract request metadata
        String ipAddress = null;
        String userAgent = null;
        String requestPath = null;
        String requestMethod = null;

        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attrs.getRequest();
            ipAddress = auditService.resolveClientIp(request);
            userAgent = request.getHeader("User-Agent");
            requestPath = request.getRequestURI();
            requestMethod = request.getMethod();
        } catch (Exception ignored) {
            // not in a web context
        }

        boolean success = true;
        String errorMessage = null;
        Object result = null;

        try {
            result = pjp.proceed();
        } catch (Throwable t) {
            success = false;
            errorMessage = t.getMessage();
            throw t;
        } finally {
            try {
                auditService.log(
                        auditable.entityType(),
                        null,
                        auditable.action(),
                        auditable.description().isBlank()
                                ? method.getName()
                                : auditable.description(),
                        userId,
                        userName,
                        userEmail,
                        userRole,
                        ipAddress,
                        userAgent,
                        requestPath,
                        requestMethod,
                        success,
                        errorMessage
                );
            } catch (Exception e) {
                logger.error("AuditAspect failed to record log: {}", e.getMessage());
            }
        }
        return result;
    }
}
