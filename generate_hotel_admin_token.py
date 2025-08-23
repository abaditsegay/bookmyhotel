#!/usr/bin/env python3
import jwt
import datetime

# JWT secret from application.properties - must match the backend
JWT_SECRET = "bookmyhotelverylongsecretkeythatisatleast512bitslongforsecuritywithjwtandhs512algorithmthisisasupersecurekey2024bookmyhotelapp"

# Create a hotel admin token for testing
username = "hotel.admin@grandplaza.com"
hotel_id = 1
tenant_id = "d7b7e673-6788-45b2-8dad-4d48944a144e"

# Token validity: 24 hours  
now = datetime.datetime.utcnow()
expiry = now + datetime.timedelta(hours=24)

payload = {
    'sub': username,
    'hotelId': hotel_id,
    'tenantId': tenant_id,
    'roles': ['HOTEL_ADMIN'],
    'iat': now,
    'exp': expiry
}

# Generate the token
token = jwt.encode(payload, JWT_SECRET, algorithm='HS512')
print(f"Hotel Admin JWT Token: {token}")
print(f"Username: {username}")
print(f"Hotel ID: {hotel_id}")
print(f"Tenant ID: {tenant_id}")
print(f"Valid until: {expiry}")
