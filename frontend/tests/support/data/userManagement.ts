export interface UserCreationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'ADMIN' | 'HOTEL_ADMIN' | 'TESTER';
}

export function buildUserCreationData(): UserCreationData {
  const stamp = Date.now();
  const suffix = Math.floor(Math.random() * 10_000).toString().padStart(4, '0');

  return {
    firstName: 'Playwright',
    lastName: `Admin${suffix}`,
    email: `playwright.admin.${stamp}.${suffix}@example.com`,
    password: 'SecurePass123!',
    phone: `0911${Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')}`,
    role: 'ADMIN',
  };
}