export interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenantId: string;
  userId: number;
  iat: number;
  exp: number;
}

export const decodeJwtToken = (token: string): JwtPayload | null => {
  try {
    // JWT tokens have three parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode from base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse as JSON
    const parsedPayload = JSON.parse(decodedPayload) as JwtPayload;
    
    return parsedPayload;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtToken(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

export const getTenantIdFromToken = (token: string): string | null => {
  const payload = decodeJwtToken(token);
  return payload?.tenantId || null;
};
