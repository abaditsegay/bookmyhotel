package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

class EthiopianDemoDatasetCatalogTest {

    @Test
    void hotelSeedSpecsShouldMatchRequestedDistribution() {
        Map<Integer, Long> byRoomCount = EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream()
                .collect(Collectors.groupingBy(EthiopianDemoDatasetCatalog.HotelSeedSpec::roomCount, Collectors.counting()));

        assertEquals(20, EthiopianDemoDatasetCatalog.hotelSeedSpecs().size());
        assertEquals(2000, EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream()
                .mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::roomCount)
                .sum());
        assertEquals(10L, byRoomCount.getOrDefault(100, 0L));
        assertEquals(5L, byRoomCount.getOrDefault(50, 0L));
        assertEquals(5L, byRoomCount.getOrDefault(150, 0L));
    }

    @Test
    void lastNamesShouldExcludeFemaleFirstNames() {
        assertTrue(EthiopianDemoDatasetCatalog.femaleNamesExcludedFromLastNames());
    }

    @Test
    void reportShouldSummarizeRequestedDatasetShape() {
        EthiopianDemoDatasetSeeder.DatasetReport report = new EthiopianDemoDatasetSeeder.DatasetReport(
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().size(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::roomCount).sum(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().filter(spec -> spec.roomCount() == 50).count(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().filter(spec -> spec.roomCount() == 100).count(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().filter(spec -> spec.roomCount() == 150).count(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::reservationCount).sum(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::shopOrderCount).sum(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::maintenanceTaskCount).sum(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::customerCount).sum(),
                EthiopianDemoDatasetCatalog.femaleNamesExcludedFromLastNames());

        assertEquals(20, report.hotelCount());
        assertEquals(2000, report.totalRoomCount());
        assertEquals(5, report.hotelsWith50Rooms());
        assertEquals(10, report.hotelsWith100Rooms());
        assertEquals(5, report.hotelsWith150Rooms());
        assertTrue(report.femaleNamesExcludedFromLastNames());
    }
}