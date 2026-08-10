const normalizeUrl = (value: string | undefined) => value?.trim().replace(/\/$/, '') ?? '';

export const runtimeConfig = {
  apiBaseUrl: normalizeUrl(process.env.EXPO_PUBLIC_API_BASE_URL),
  enableAuthMock: process.env.EXPO_PUBLIC_ENABLE_AUTH_MOCK === 'true',
} as const;

export const hasRemoteApi = runtimeConfig.apiBaseUrl.length > 0;
