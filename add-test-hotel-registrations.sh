#!/bin/bash

# Script to add multiple hotel registrations for testing
# This will create several hotel registrations that can be approved/rejected

API_BASE="http://localhost:8080/api"

echo "🏨 Adding multiple hotel registrations for testing..."
echo "=================================="

# Hotel Registration 1 - Luxury Resort
echo "📝 Adding Luxury Resort..."
curl -X POST "${API_BASE}/hotel-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelName": "Grand Luxury Resort & Spa",
    "description": "A premium luxury resort offering world-class amenities, spa services, and breathtaking ocean views. Perfect for romantic getaways and luxury travelers.",
    "address": "123 Ocean Drive, Beachfront District",
    "city": "Miami Beach",
    "state": "Florida",
    "country": "United States",
    "zipCode": "33139",
    "phone": "+1-305-555-0123",
    "contactEmail": "info@grandluxuryresort.com",
    "contactPerson": "Maria Rodriguez",
    "licenseNumber": "FL-HTL-2024-001",
    "taxId": "65-1234567",
    "websiteUrl": "https://www.grandluxuryresort.com",
    "facilityAmenities": "Ocean View Rooms, Full-Service Spa, 3 Restaurants, Private Beach, Infinity Pool, Fitness Center, Conference Rooms, Concierge Service",
    "numberOfRooms": 150,
    "checkInTime": "15:00",
    "checkOutTime": "11:00"
  }' \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Hotel Registration 2 - Business Hotel
echo "📝 Adding Business Hotel..."
curl -X POST "${API_BASE}/hotel-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelName": "Metropolitan Business Hotel",
    "description": "Modern business hotel in the heart of downtown, perfect for corporate travelers with state-of-the-art meeting facilities and high-speed internet.",
    "address": "456 Corporate Center Blvd",
    "city": "New York",
    "state": "New York",
    "country": "United States",
    "zipCode": "10001",
    "phone": "+1-212-555-0456",
    "contactEmail": "reservations@metrobusinesshotel.com",
    "contactPerson": "James Thompson",
    "licenseNumber": "NY-HTL-2024-002",
    "taxId": "11-2345678",
    "websiteUrl": "https://www.metrobusinesshotel.com",
    "facilityAmenities": "Business Center, Meeting Rooms, High-Speed WiFi, 24/7 Room Service, Fitness Center, Restaurant, Bar, Airport Shuttle",
    "numberOfRooms": 200,
    "checkInTime": "14:00",
    "checkOutTime": "12:00"
  }' \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Hotel Registration 3 - Boutique Hotel
echo "📝 Adding Boutique Hotel..."
curl -X POST "${API_BASE}/hotel-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelName": "The Artisan Boutique Hotel",
    "description": "Charming boutique hotel featuring unique artisanal decor, locally sourced amenities, and personalized service in a historic building.",
    "address": "789 Heritage Street, Arts Quarter",
    "city": "San Francisco",
    "state": "California",
    "country": "United States",
    "zipCode": "94102",
    "phone": "+1-415-555-0789",
    "contactEmail": "hello@artisanboutiquehotel.com",
    "contactPerson": "Sofia Chen",
    "licenseNumber": "CA-HTL-2024-003",
    "taxId": "94-3456789",
    "websiteUrl": "https://www.artisanboutiquehotel.com",
    "facilityAmenities": "Art Gallery, Rooftop Garden, Local Cuisine Restaurant, Wine Bar, Library, Yoga Studio, Pet-Friendly",
    "numberOfRooms": 45,
    "checkInTime": "15:30",
    "checkOutTime": "11:30"
  }' \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Hotel Registration 4 - Mountain Lodge
echo "📝 Adding Mountain Lodge..."
curl -X POST "${API_BASE}/hotel-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelName": "Alpine Adventure Lodge",
    "description": "Rustic mountain lodge perfect for outdoor enthusiasts, offering ski-in/ski-out access, hiking trails, and cozy fireside dining.",
    "address": "321 Mountain Peak Road",
    "city": "Aspen",
    "state": "Colorado",
    "country": "United States",
    "zipCode": "81611",
    "phone": "+1-970-555-0321",
    "contactEmail": "bookings@alpineadventurelodge.com",
    "contactPerson": "Michael Anderson",
    "licenseNumber": "CO-HTL-2024-004",
    "taxId": "84-4567890",
    "websiteUrl": "https://www.alpineadventurelodge.com",
    "facilityAmenities": "Ski Equipment Rental, Hot Tub, Fireplace Lounge, Mountain Guide Services, Restaurant, Equipment Storage, Shuttle Service",
    "numberOfRooms": 80,
    "checkInTime": "16:00",
    "checkOutTime": "10:00"
  }' \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Hotel Registration 5 - International Hotel (Problematic - for rejection testing)
echo "📝 Adding International Hotel (Test Rejection)..."
curl -X POST "${API_BASE}/hotel-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelName": "Global International Hotel",
    "description": "International hotel chain expansion.",
    "address": "555 International Plaza",
    "city": "London",
    "state": "",
    "country": "United Kingdom",
    "zipCode": "SW1A 1AA",
    "phone": "+44-20-7555-0555",
    "contactEmail": "expansion@globalhotel.com",
    "contactPerson": "Robert Wilson",
    "licenseNumber": "",
    "taxId": "",
    "websiteUrl": "https://www.globalhotel.com",
    "facilityAmenities": "Standard hotel amenities",
    "numberOfRooms": 300,
    "checkInTime": "14:00",
    "checkOutTime": "11:00"
  }' \
  -w "\nStatus: %{http_code}\n\n"

sleep 1

# Hotel Registration 6 - Family Resort
echo "📝 Adding Family Resort..."
curl -X POST "${API_BASE}/hotel-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelName": "Sunshine Family Resort",
    "description": "All-inclusive family resort with kids club, water park, and entertainment programs designed for families with children of all ages.",
    "address": "888 Resort Boulevard",
    "city": "Orlando",
    "state": "Florida",
    "country": "United States",
    "zipCode": "32819",
    "phone": "+1-407-555-0888",
    "contactEmail": "families@sunshinefamilyresort.com",
    "contactPerson": "Jennifer Davis",
    "licenseNumber": "FL-HTL-2024-005",
    "taxId": "59-5678901",
    "websiteUrl": "https://www.sunshinefamilyresort.com",
    "facilityAmenities": "Water Park, Kids Club, Game Room, Multiple Pools, Family Restaurants, Mini Golf, Playground, Babysitting Services",
    "numberOfRooms": 250,
    "checkInTime": "15:00",
    "checkOutTime": "11:00"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "✅ All hotel registrations have been submitted!"
echo "=================================="
echo "📊 Summary:"
echo "   • Grand Luxury Resort & Spa (Miami Beach)"
echo "   • Metropolitan Business Hotel (New York)"
echo "   • The Artisan Boutique Hotel (San Francisco)"
echo "   • Alpine Adventure Lodge (Aspen)"
echo "   • Global International Hotel (London) - Test for rejection"
echo "   • Sunshine Family Resort (Orlando)"
echo ""
echo "🎯 You can now test the approval/rejection workflow in the admin panel!"
echo "💡 Tip: Global International Hotel has minimal details and can be used to test rejection."
