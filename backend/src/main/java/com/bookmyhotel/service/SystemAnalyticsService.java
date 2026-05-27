package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.repository.ReservationRepository;

@Service
@Transactional(readOnly = true)
public class SystemAnalyticsService {

    private static final ZoneId ETHIOPIA_ZONE = ZoneId.of("Africa/Addis_Ababa");
    private static final EnumSet<ReservationStatus> ACTIVE_BOOKING_STATUSES = EnumSet.of(
            ReservationStatus.BOOKED,
            ReservationStatus.CHECKED_IN);

    private final ReservationRepository reservationRepository;

    public SystemAnalyticsService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public SystemAnalyticsOverview getOverview() {
        List<Reservation> reservations = reservationRepository.findAll();
        YearMonth currentMonth = YearMonth.now(ETHIOPIA_ZONE);
        int currentYear = currentMonth.getYear();

        LinkedHashMap<YearMonth, MonthlyTrend> monthlyTrendMap = new LinkedHashMap<>();
        for (int monthOffset = 5; monthOffset >= 0; monthOffset--) {
            YearMonth month = currentMonth.minusMonths(monthOffset);
            monthlyTrendMap.put(month, new MonthlyTrend(monthLabel(month), 0L, BigDecimal.ZERO));
        }

        Map<ReservationStatus, Long> reservationStatusCounts = new EnumMap<>(ReservationStatus.class);
        Map<PaymentStatus, Long> paymentStatusCounts = new EnumMap<>(PaymentStatus.class);

        long activeBookings = 0L;
        long completedPayments = 0L;
        long currentMonthBookings = 0L;
        BigDecimal currentMonthRevenue = BigDecimal.ZERO;
        BigDecimal currentYearRevenue = BigDecimal.ZERO;

        for (Reservation reservation : reservations) {
            ReservationStatus reservationStatus = reservation.getStatus();
            if (reservationStatus != null) {
                reservationStatusCounts.merge(reservationStatus, 1L, Long::sum);
                if (ACTIVE_BOOKING_STATUSES.contains(reservationStatus)) {
                    activeBookings++;
                }
            }

            PaymentStatus paymentStatus = reservation.getPaymentStatus();
            if (paymentStatus != null) {
                paymentStatusCounts.merge(paymentStatus, 1L, Long::sum);
                if (paymentStatus == PaymentStatus.COMPLETED) {
                    completedPayments++;
                }
            }

            if (reservation.getCreatedAt() == null) {
                continue;
            }

            YearMonth reservationMonth = YearMonth.from(reservation.getCreatedAt());
            MonthlyTrend trend = monthlyTrendMap.get(reservationMonth);
            if (trend != null) {
                trend.setBookings(trend.getBookings() + 1);
            }

            if (reservationMonth.equals(currentMonth)) {
                currentMonthBookings++;
            }

            BigDecimal totalAmount = reservation.getTotalAmount() != null ? reservation.getTotalAmount() : BigDecimal.ZERO;
            if (paymentStatus == PaymentStatus.COMPLETED) {
                if (trend != null) {
                    trend.setRevenue(trend.getRevenue().add(totalAmount));
                }
                if (reservationMonth.equals(currentMonth)) {
                    currentMonthRevenue = currentMonthRevenue.add(totalAmount);
                }
                if (reservation.getCreatedAt().getYear() == currentYear) {
                    currentYearRevenue = currentYearRevenue.add(totalAmount);
                }
            }
        }

        return new SystemAnalyticsOverview(
                reservations.size(),
                activeBookings,
                completedPayments,
                currentMonthBookings,
                currentMonthRevenue,
                currentYearRevenue,
                new ArrayList<>(monthlyTrendMap.values()),
                toStringKeyMap(reservationStatusCounts),
                toStringKeyMap(paymentStatusCounts));
    }

    private String monthLabel(YearMonth month) {
        return month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
    }

    private <T extends Enum<T>> Map<String, Long> toStringKeyMap(Map<T, Long> counts) {
        LinkedHashMap<String, Long> result = new LinkedHashMap<>();
        counts.forEach((key, value) -> result.put(key.name(), value));
        return result;
    }

    public static class SystemAnalyticsOverview {
        private final long totalBookings;
        private final long activeBookings;
        private final long completedPayments;
        private final long currentMonthBookings;
        private final BigDecimal currentMonthRevenue;
        private final BigDecimal currentYearRevenue;
        private final List<MonthlyTrend> monthlyTrends;
        private final Map<String, Long> reservationStatusBreakdown;
        private final Map<String, Long> paymentStatusBreakdown;

        public SystemAnalyticsOverview(long totalBookings, long activeBookings, long completedPayments,
                long currentMonthBookings, BigDecimal currentMonthRevenue, BigDecimal currentYearRevenue,
                List<MonthlyTrend> monthlyTrends, Map<String, Long> reservationStatusBreakdown,
                Map<String, Long> paymentStatusBreakdown) {
            this.totalBookings = totalBookings;
            this.activeBookings = activeBookings;
            this.completedPayments = completedPayments;
            this.currentMonthBookings = currentMonthBookings;
            this.currentMonthRevenue = currentMonthRevenue;
            this.currentYearRevenue = currentYearRevenue;
            this.monthlyTrends = monthlyTrends;
            this.reservationStatusBreakdown = reservationStatusBreakdown;
            this.paymentStatusBreakdown = paymentStatusBreakdown;
        }

        public long getTotalBookings() {
            return totalBookings;
        }

        public long getActiveBookings() {
            return activeBookings;
        }

        public long getCompletedPayments() {
            return completedPayments;
        }

        public long getCurrentMonthBookings() {
            return currentMonthBookings;
        }

        public BigDecimal getCurrentMonthRevenue() {
            return currentMonthRevenue;
        }

        public BigDecimal getCurrentYearRevenue() {
            return currentYearRevenue;
        }

        public List<MonthlyTrend> getMonthlyTrends() {
            return monthlyTrends;
        }

        public Map<String, Long> getReservationStatusBreakdown() {
            return reservationStatusBreakdown;
        }

        public Map<String, Long> getPaymentStatusBreakdown() {
            return paymentStatusBreakdown;
        }
    }

    public static class MonthlyTrend {
        private final String label;
        private long bookings;
        private BigDecimal revenue;

        public MonthlyTrend(String label, long bookings, BigDecimal revenue) {
            this.label = label;
            this.bookings = bookings;
            this.revenue = revenue;
        }

        public String getLabel() {
            return label;
        }

        public long getBookings() {
            return bookings;
        }

        public void setBookings(long bookings) {
            this.bookings = bookings;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }
}