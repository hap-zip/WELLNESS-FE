import { ApiError } from '@/services/api-error';

export type AuthCredentials = { email: string; password: string };
export type SignUpCredentials = AuthCredentials & { nickname: string };
export type AuthResult = { accessToken: string; userId: string };

export interface AuthApi {
  signIn(credentials: AuthCredentials): Promise<AuthResult>;
  signUp(credentials: SignUpCredentials): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<void>;
}

export const TEMPORARY_TEST_ACCOUNT = {
  email: 'test@navr.com',
  password: 'qwer1234',
} as const;

class TemporaryAuthApi implements AuthApi {
  async signIn(credentials: AuthCredentials) {
    const email = credentials.email.trim().toLowerCase();
    if (email !== TEMPORARY_TEST_ACCOUNT.email || credentials.password !== TEMPORARY_TEST_ACCOUNT.password) {
      throw new ApiError('테스트 계정의 이메일과 비밀번호를 확인해 주세요.', 401, 'INVALID_TEST_ACCOUNT');
    }
    return { accessToken: 'temporary-health-test-token', userId: 'health-test-user' };
  }
  async signUp(): Promise<AuthResult> {
    throw new ApiError('현재는 지정된 테스트 계정으로만 로그인할 수 있어요.', 503, 'TEST_ACCOUNT_ONLY');
  }
  async requestPasswordReset(email: string) {
    if (email.trim().toLowerCase() !== TEMPORARY_TEST_ACCOUNT.email) {
      throw new ApiError('테스트 계정 이메일을 확인해 주세요.', 404, 'TEST_ACCOUNT_NOT_FOUND');
    }
  }
}

// 백엔드 인증 연결 전 HealthKit 실기기 검증에만 사용하는 임시 인증 구현이다.
// 실제 인증 API가 준비되면 이 인스턴스만 원격 구현으로 교체한다.
export const authApi: AuthApi = new TemporaryAuthApi();
