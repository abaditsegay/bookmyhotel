#!/usr/bin/env python3
import jwt
import datetime

# JWT secret from application.properties
JWT_SECRET = "bookmyhotelverylongsecretkeythatisatleast512bitslongforsecuritywithjwtandhs512algorithmthisisasupersecurekey2024bookmyhotelapp"

# Create token for reservation ID 6 with guest email test@example.com
reservation_id = 6
guest_email = "test@example.com"

# Token validity: 365 days
now = datetime.datetime.utcnow()
expiry = now + datetime.timedelta(days=365)

payload = {
    'sub': f'booking:{reservation_id}',
    'reservationId': reservation_id,
    'guestEmail': guest_email,
    'type': 'booking_management',
    'iat': now,
    'exp': expiry
}

# Generate the token
token = jwt.encode(payload, JWT_SECRET, algorithm='HS512')
print(f"Booking management token: {token}")
