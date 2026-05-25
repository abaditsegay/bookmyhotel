import type { Page } from '@playwright/test';

type MockAuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  roles: string[];
  tenantId?: string | null;
  hotelId?: string;
  hotelName?: string;
};

type SeedAuthOptions = {
  token?: string;
  refreshToken?: string;
};

const base64UrlEncode = (value: string): string =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

export function createMockJwt(user: MockAuthUser): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.email,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      tenantId: user.tenantId ?? null,
      userId: Number(user.id),
      iat: nowSeconds,
      exp: nowSeconds + 60 * 60,
    })
  );

  return `${header}.${payload}.playwright-signature`;
}

export async function seedAuthSession(page: Page, user: MockAuthUser, options: SeedAuthOptions = {}): Promise<string> {
  const token = options.token ?? createMockJwt(user);
  const refreshToken = options.refreshToken ?? 'playwright-refresh-token';

  await page.addInitScript(
    ({ authToken, authUser, authRefreshToken }) => {
      window.localStorage.setItem('auth_token', authToken);
      window.localStorage.setItem('auth_user', JSON.stringify(authUser));
      window.localStorage.setItem('auth_refresh_token', authRefreshToken);
    },
    {
      authToken: token,
      authUser: user,
      authRefreshToken: refreshToken,
    }
  );

  return token;
}