package com.bookmyhotel.service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.BookingResponse;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

/**
 * PDF generation service for booking confirmations and reports
 */
@Service
@Transactional
public class PdfService {

    @Value("${app.name:BookMyHotel}")
    private String appName;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    /**
     * Generate booking confirmation PDF
     */
    public byte[] generateBookingConfirmationPdf(BookingResponse booking) {
        try {
            // Create PDF document
            return createBookingPdf(booking);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate booking confirmation PDF", e);
        }
    }

    /**
     * Create booking PDF document
     */
    private byte[] createBookingPdf(BookingResponse booking) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument);

            // Header
            document.add(new Paragraph(appName)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(20)
                .setBold());
            
            document.add(new Paragraph("Booking Confirmation")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(16)
                .setBold());

            // Confirmation details
            document.add(new Paragraph("Reservation ID: " + booking.getReservationId())
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(14)
                .setBold());
            
            document.add(new Paragraph("Confirmation Number: " + booking.getConfirmationNumber())
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(14)
                .setBold());

            document.add(new Paragraph(" ")); // Space

            // Booking details table
            Table table = new Table(UnitValue.createPercentArray(new float[]{30, 70}));
            table.setWidth(UnitValue.createPercentValue(100));

            // Guest Information
            addTableRow(table, "Guest Name:", booking.getGuestName());
            addTableRow(table, "Email:", booking.getGuestEmail());

            // Hotel Information
            addTableRow(table, "Hotel:", booking.getHotelName());
            addTableRow(table, "Address:", booking.getHotelAddress());

            // Room Information
            addTableRow(table, "Room:", booking.getRoomNumber() + " (" + booking.getRoomType() + ")");

            // Dates
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy");
            addTableRow(table, "Check-in:", booking.getCheckInDate().format(formatter));
            addTableRow(table, "Check-out:", booking.getCheckOutDate().format(formatter));

            // Duration and pricing
            long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
            addTableRow(table, "Nights:", String.valueOf(nights));
            addTableRow(table, "Rate per night:", "$" + booking.getPricePerNight());
            addTableRow(table, "Total Amount:", "$" + booking.getTotalAmount());

            // Status
            addTableRow(table, "Status:", booking.getStatus());
            addTableRow(table, "Payment Status:", booking.getPaymentStatus());

            document.add(table);

            // Important information
            document.add(new Paragraph(" ")); // Space
            document.add(new Paragraph("Important Information:")
                .setFontSize(14)
                .setBold());

            document.add(new Paragraph("• Please bring a valid ID for check-in"));
            document.add(new Paragraph("• Check-in time: 3:00 PM | Check-out time: 11:00 AM"));
            document.add(new Paragraph("• For any changes or cancellations, please contact the hotel directly"));
            document.add(new Paragraph("• Keep your reservation ID and confirmation number for reference"));

            // Footer
            document.add(new Paragraph(" ")); // Space
            document.add(new Paragraph("Thank you for choosing " + appName + "!")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(12));

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to create PDF document", e);
        }
    }

    /**
     * Add a row to the table
     */
    private void addTableRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setBold()));
        table.addCell(new Cell().add(new Paragraph(value)));
    }
}
