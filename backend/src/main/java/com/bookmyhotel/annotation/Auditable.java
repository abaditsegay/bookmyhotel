package com.bookmyhotel.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a method for automatic system audit logging.
 * The AuditAspect intercepts annotated methods and writes a SystemAuditLog
 * entry.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    /**
     * The action verb (CREATE, UPDATE, DELETE, VIEW, APPROVE, REJECT, LOGIN, etc.)
     */
    String action() default "ACTION";

    /** The entity type being operated on (USER, HOTEL, TENANT, SYSTEM, etc.) */
    String entityType() default "SYSTEM";

    /** Human-readable description template (e.g. "Created hotel"). */
    String description() default "";
}
