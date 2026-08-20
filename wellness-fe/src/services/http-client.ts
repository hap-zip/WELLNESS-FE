import { runtimeConfig } from '@/config/runtime';
import { ApiError } from '@/services/api-error';
import { sessionStore } from '@/services/session-store';

type QueryValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryValue>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: QueryParams;
  body?: unknown;
  /** 인증 헤더 첨부 여부. 기본 true (로그인/회원가입/탈퇴만 false로 호출). */
  auth?: boolean;
  /** 2xx가 아니어도 예외를 던지지 않고 파싱된 바디를 그대로 반환한다 (예: 챗봇 400/401 가드레일 응답). */
  parseOnAnyStatus?: boolean;
};

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(`${runtimeConfig.apiBaseUrl}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function extractField(data: unknown, field: string): string | undefined {
  if (data && typeof data === 'object' && field in data) {
    const value = (data as Record<string, unknown>)[field];
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', params, body, auth = true, parseOnAnyStatus = false } = options;

  if (!runtimeConfig.apiBaseUrl) {
    throw new ApiError('백엔드 주소가 설정되지 않았어요. EXPO_PUBLIC_API_BASE_URL을 확인해 주세요.', undefined, 'NO_API_BASE_URL');
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let effectiveParams = params;
  if (auth) {
    const session = await sessionStore.read();
    if (!session?.accessToken) throw new ApiError('로그인이 필요해요.', 401, 'NO_ACCESS_TOKEN');
    headers.Authorization = `Bearer ${session.accessToken}`;
    // 로그인 응답에서 받은 실제 userId를 모든 인증된 요청에 자동으로 실어 보낸다.
    effectiveParams = { userId: session.userId, ...params };
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, effectiveParams), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('네트워크 연결을 확인해 주세요.', undefined, 'NETWORK_ERROR');
  }

  const text = await response.text();
  const data = text ? safeJsonParse(text) : undefined;

  if (!response.ok && !parseOnAnyStatus) {
    const message = extractField(data, 'message') ?? extractField(data, 'error') ?? `요청을 처리하지 못했어요. (${response.status})`;
    throw new ApiError(message, response.status, extractField(data, 'code'));
  }

  return data as T;
}

export const httpClient = {
  get: <T>(path: string, params?: QueryParams) => request<T>(path, { method: 'GET', params }),
  post: <T>(path: string, body?: unknown, params?: QueryParams) => request<T>(path, { method: 'POST', body, params }),
  put: <T>(path: string, body?: unknown, params?: QueryParams) => request<T>(path, { method: 'PUT', body, params }),
  patch: <T>(path: string, body?: unknown, params?: QueryParams) => request<T>(path, { method: 'PATCH', body, params }),
  delete: <T>(path: string, params?: QueryParams) => request<T>(path, { method: 'DELETE', params }),
  /** 인증이 필요 없는 호출 (로그인/회원가입/탈퇴). */
  postPublic: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body, auth: false }),
  /** 2xx가 아니어도 던지지 않고 바디를 그대로 반환. */
  postAllowError: <T>(path: string, body?: unknown, params?: QueryParams) =>
    request<T>(path, { method: 'POST', body, params, parseOnAnyStatus: true }),
};
