package com.bookmyhotel.audit;

import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class AuditTaxonomy {

    private static final List<String> ENTITY_TYPE_VALUES = List.of(
            EntityType.AUTH,
            EntityType.HOTEL,
            EntityType.USER,
            EntityType.ROOM,
            EntityType.ROOM_BATCH,
            EntityType.RESERVATION,
            EntityType.PRODUCT,
            EntityType.SHOP_ORDER,
            EntityType.PAYMENT,
            EntityType.PRICING_CONFIG,
            EntityType.HOUSEKEEPING_TASK,
            EntityType.HOUSEKEEPING_STAFF);

            private static final Set<String> ENTITY_TYPES = Set.copyOf(ENTITY_TYPE_VALUES);

            private static final List<String> ACTION_VALUES = List.of(
            Action.CREATE,
            Action.UPDATE,
            Action.DELETE,
            Action.LOGIN,
            Action.LOGIN_FAILED,
            Action.LOGOUT,
            Action.STATUS_CHANGE,
            Action.PAYMENT_STATUS_CHANGE,
            Action.PAYMENT_METHOD_CHANGE,
            Action.PAYMENT_CALLBACK,
            Action.PAYMENT_INITIATED,
            Action.PAYMENT_INITIATION_FAILED,
            Action.BOOKING_CANCELLED,
            Action.BOOKING_MODIFIED,
            Action.CHECK_IN,
            Action.CHECK_OUT,
            Action.CANCEL,
            Action.NO_SHOW,
            Action.ASSIGN,
            Action.AUTO_ASSIGN,
            Action.START,
            Action.COMPLETE,
            Action.COMPLETE_WITH_ISSUES,
            Action.ACTIVATE,
            Action.DEACTIVATE,
            Action.STOCK_UPDATE,
            Action.STOCK_DECREASE,
            Action.STOCK_RESTORE,
            Action.ACTIVE_STATUS_CHANGE,
            Action.AVAILABILITY_CHANGE,
            Action.MARK_PAID,
            Action.TOGGLE_STATUS,
            Action.ROOM_ASSIGNMENT_CHANGE);

            private static final Set<String> ACTIONS = Set.copyOf(ACTION_VALUES);

            private static final List<String> COMPLIANCE_CATEGORY_VALUES = List.of(
            ComplianceCategory.FINANCIAL,
            ComplianceCategory.ACCESS_CONTROL);

            private static final Set<String> COMPLIANCE_CATEGORIES = Set.copyOf(COMPLIANCE_CATEGORY_VALUES);

    private AuditTaxonomy() {
    }

    public static String normalizeEntityType(String value) {
        return normalizeRequired(value, ENTITY_TYPES, "entityType");
    }

    public static List<String> entityTypes() {
        return ENTITY_TYPE_VALUES;
    }

    public static String normalizeAction(String value) {
        return normalizeRequired(value, ACTIONS, "action");
    }

    public static List<String> actions() {
        return ACTION_VALUES;
    }

    public static String normalizeComplianceCategory(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return normalizeRequired(value, COMPLIANCE_CATEGORIES, "complianceCategory");
    }

    public static List<String> complianceCategories() {
        return COMPLIANCE_CATEGORY_VALUES;
    }

    private static String normalizeRequired(String value, Set<String> allowedValues, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (!allowedValues.contains(normalized)) {
            throw new IllegalArgumentException("Unsupported " + fieldName + ": " + value);
        }

        return normalized;
    }

    public static final class EntityType {
        public static final String AUTH = "AUTH";
        public static final String HOTEL = "HOTEL";
        public static final String USER = "USER";
        public static final String ROOM = "ROOM";
        public static final String ROOM_BATCH = "ROOM_BATCH";
        public static final String RESERVATION = "RESERVATION";
        public static final String PRODUCT = "PRODUCT";
        public static final String SHOP_ORDER = "SHOP_ORDER";
        public static final String PAYMENT = "PAYMENT";
        public static final String PRICING_CONFIG = "PRICING_CONFIG";
        public static final String HOUSEKEEPING_TASK = "HOUSEKEEPING_TASK";
        public static final String HOUSEKEEPING_STAFF = "HOUSEKEEPING_STAFF";

        private EntityType() {
        }
    }

    public static final class Action {
        public static final String CREATE = "CREATE";
        public static final String UPDATE = "UPDATE";
        public static final String DELETE = "DELETE";
        public static final String LOGIN = "LOGIN";
        public static final String LOGIN_FAILED = "LOGIN_FAILED";
        public static final String LOGOUT = "LOGOUT";
        public static final String STATUS_CHANGE = "STATUS_CHANGE";
        public static final String PAYMENT_STATUS_CHANGE = "PAYMENT_STATUS_CHANGE";
        public static final String PAYMENT_METHOD_CHANGE = "PAYMENT_METHOD_CHANGE";
        public static final String PAYMENT_CALLBACK = "PAYMENT_CALLBACK";
        public static final String PAYMENT_INITIATED = "PAYMENT_INITIATED";
        public static final String PAYMENT_INITIATION_FAILED = "PAYMENT_INITIATION_FAILED";
        public static final String BOOKING_CANCELLED = "BOOKING_CANCELLED";
        public static final String BOOKING_MODIFIED = "BOOKING_MODIFIED";
        public static final String CHECK_IN = "CHECK_IN";
        public static final String CHECK_OUT = "CHECK_OUT";
        public static final String CANCEL = "CANCEL";
        public static final String NO_SHOW = "NO_SHOW";
        public static final String ASSIGN = "ASSIGN";
        public static final String AUTO_ASSIGN = "AUTO_ASSIGN";
        public static final String START = "START";
        public static final String COMPLETE = "COMPLETE";
        public static final String COMPLETE_WITH_ISSUES = "COMPLETE_WITH_ISSUES";
        public static final String ACTIVATE = "ACTIVATE";
        public static final String DEACTIVATE = "DEACTIVATE";
        public static final String STOCK_UPDATE = "STOCK_UPDATE";
        public static final String STOCK_DECREASE = "STOCK_DECREASE";
        public static final String STOCK_RESTORE = "STOCK_RESTORE";
        public static final String ACTIVE_STATUS_CHANGE = "ACTIVE_STATUS_CHANGE";
        public static final String AVAILABILITY_CHANGE = "AVAILABILITY_CHANGE";
        public static final String MARK_PAID = "MARK_PAID";
        public static final String TOGGLE_STATUS = "TOGGLE_STATUS";
        public static final String ROOM_ASSIGNMENT_CHANGE = "ROOM_ASSIGNMENT_CHANGE";

        private Action() {
        }
    }

    public static final class ComplianceCategory {
        public static final String FINANCIAL = "FINANCIAL";
        public static final String ACCESS_CONTROL = "ACCESS_CONTROL";

        private ComplianceCategory() {
        }
    }
}