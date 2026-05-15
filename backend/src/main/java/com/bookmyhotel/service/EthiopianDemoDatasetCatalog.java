package com.bookmyhotel.service;

import java.util.List;
import java.util.Set;

public final class EthiopianDemoDatasetCatalog {

    public record HotelSeedSpec(
            String code,
            String name,
            String city,
            String address,
            String contactPerson,
            int roomCount,
            int reservationCount,
            int shopOrderCount,
            int maintenanceTaskCount,
            int customerCount) {
    }

    private static final List<HotelSeedSpec> HOTEL_SEED_SPECS = List.of(
            new HotelSeedSpec("bole-crown", "Bole Crown Hotel", "Addis Ababa", "Bole Atlas Road, Addis Ababa",
                    "Yohannes Bekele", 150, 44, 20, 6, 14),
            new HotelSeedSpec("meskel-plaza", "Meskel Plaza Hotel", "Addis Ababa", "Meskel Square Avenue, Addis Ababa",
                    "Meron Tadesse", 150, 42, 20, 6, 14),
            new HotelSeedSpec("entoto-sky", "Entoto Sky Resort", "Addis Ababa", "Entoto Park Ridge Road, Addis Ababa",
                    "Birhanu Tesfaye", 150, 40, 20, 6, 14),
            new HotelSeedSpec("hawassa-lake", "Hawassa Lake View Hotel", "Hawassa", "Gudumale Lakeside, Hawassa",
                    "Kalkidan Assefa", 150, 40, 20, 6, 14),
            new HotelSeedSpec("bahir-dar-blue", "Bahir Dar Blue Nile Grand", "Bahir Dar", "Kebele 14 Lakeshore, Bahir Dar",
                    "Mekdes Alemu", 150, 40, 20, 6, 14),

            new HotelSeedSpec("axum-heritage", "Axum Heritage Hotel", "Axum", "Stelae Road, Axum",
                    "Abel Gebre", 100, 30, 14, 4, 10),
            new HotelSeedSpec("gondar-castle", "Gondar Castle View Hotel", "Gondar", "Fasil Road, Gondar",
                    "Selamawit Hailu", 100, 30, 14, 4, 10),
            new HotelSeedSpec("lalibela-terrace", "Lalibela Terrace Hotel", "Lalibela", "Rock Church Quarter, Lalibela",
                    "Henok Desta", 100, 30, 14, 4, 10),
            new HotelSeedSpec("dire-dawa-oasis", "Dire Dawa Oasis Hotel", "Dire Dawa", "Kezira Boulevard, Dire Dawa",
                    "Aster Fekadu", 100, 30, 14, 4, 10),
            new HotelSeedSpec("jimma-gold", "Jimma Gold Coffee Hotel", "Jimma", "Agaro Road, Jimma",
                    "Abinet Worku", 100, 30, 14, 4, 10),
            new HotelSeedSpec("mekelle-highland", "Mekelle Highland Hotel", "Mekelle", "Romanat District, Mekelle",
                    "Rahel Gebremedhin", 100, 30, 14, 4, 10),
            new HotelSeedSpec("adama-rift", "Adama Rift Valley Hotel", "Adama", "Nazret Main Road, Adama",
                    "Fikadu Nigatu", 100, 30, 14, 4, 10),
            new HotelSeedSpec("arbaminch-garden", "Arba Minch Garden Inn", "Arba Minch", "Nech Sar Road, Arba Minch",
                    "Elsabet Kassahun", 100, 30, 14, 4, 10),
            new HotelSeedSpec("harar-gate", "Harar Gate Heritage Hotel", "Harar", "Jugol Gate Street, Harar",
                    "Misrak Solomon", 100, 30, 14, 4, 10),
            new HotelSeedSpec("dessie-highview", "Dessie Highview Hotel", "Dessie", "Tossa Road, Dessie",
                    "Nahom Getachew", 100, 30, 14, 4, 10),

            new HotelSeedSpec("debrezeit-canal", "Debre Zeit Canal Side Hotel", "Bishoftu", "Kuriftu Canal Road, Bishoftu",
                    "Tigist Melese", 50, 18, 8, 2, 7),
            new HotelSeedSpec("kombolcha-sunrise", "Kombolcha Sunrise Hotel", "Kombolcha", "Industrial Park Road, Kombolcha",
                    "Girma Endale", 50, 18, 8, 2, 7),
            new HotelSeedSpec("assosa-green", "Assosa Green Valley Hotel", "Assosa", "Benishangul Square, Assosa",
                    "Lensa Deressa", 50, 18, 8, 2, 7),
            new HotelSeedSpec("jijiga-plateau", "Jijiga Plateau Hotel", "Jijiga", "Kebele 05 Main Street, Jijiga",
                    "Birtukan Lemma", 50, 18, 8, 2, 7),
            new HotelSeedSpec("semera-oasis", "Semera Oasis Lodge", "Semera", "Afar Regional Avenue, Semera",
                    "Tamirat Dinku", 50, 18, 8, 2, 7));

    private static final List<String> MALE_FIRST_NAMES = List.of(
            "Abel", "Abinet", "Abiy", "Adisu", "Alemayehu", "Amanuel", "Asefa", "Birhanu", "Dagmawi",
            "Dawit", "Dems", "Elias", "Endale", "Fikadu", "Girma", "Habtamu", "Henok", "Kebede", "Kidus",
            "Merga", "Mesfin", "Nahom", "Natnael", "Solomon", "Tamirat", "Taye", "Temesgen", "Yared",
            "Yohannes", "Zelalem");

    private static final List<String> FEMALE_FIRST_NAMES = List.of(
            "Almaz", "Aster", "Birtukan", "Dagmawit", "Elsabet", "Feven", "Genet", "Hana", "Hiwot",
            "Kalkidan", "Kidist", "Mekdes", "Meron", "Meseret", "Misrak", "Rahel", "Rediet", "Selamawit",
            "Tigist", "Yordanos");

    private static final List<String> LAST_NAMES = List.of(
            "Alemu", "Asfaw", "Assefa", "Bekele", "Desta", "Dinku", "Endale", "Fekadu", "Gebre",
            "Gebremedhin", "Getachew", "Hailu", "Kassahun", "Lemma", "Melese", "Nigatu", "Solomon",
            "Tadesse", "Tesfaye", "Weldemariam", "Worku");

    private EthiopianDemoDatasetCatalog() {
    }

    public static List<HotelSeedSpec> hotelSeedSpecs() {
        return HOTEL_SEED_SPECS;
    }

    public static List<String> maleFirstNames() {
        return MALE_FIRST_NAMES;
    }

    public static List<String> femaleFirstNames() {
        return FEMALE_FIRST_NAMES;
    }

    public static List<String> lastNames() {
        return LAST_NAMES;
    }

    public static boolean femaleNamesExcludedFromLastNames() {
        return LAST_NAMES.stream().noneMatch(Set.copyOf(FEMALE_FIRST_NAMES)::contains);
    }
}