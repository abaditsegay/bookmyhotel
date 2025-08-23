#!/usr/bin/env python3
import jwt
import datetime

# JWT secret from application.properties
JWT_SECRET = "bookmyhotelverylongsecretkeythatisatleast512bitslongforsecuritywithjwtandhs512algorithmthisisasupersecurekey2024bookmyhotelapp"

# Create token for a hotel admin user
user_id = 1
hotel_id = 1
tenant_id = "d7b7e673-6788-45b2-8dad-4d48944a144e"

# Token validity: 30 days
now = datetime.datetime.utcnow()
expiry = now + datetime.timedelta(days=30)

payload = {
    'sub': 'hotel.admin@grandplaza.com',  # Use email as subject
    'userId': 2,
    'email': 'hotel.admin@grandplaza.com',
    'firstName': 'John',
    'lastName': 'Manager',
    'hotelId': hotel_id,
    'tenantId': tenant_id,
    'roles': ['HOTEL_ADMIN'],
    'iat': now,
    'exp': expiry
}

# Generate the token
token = jwt.encode(payload, JWT_SECRET, algorithm='HS512')
print(f"Hotel admin token: {token}")
