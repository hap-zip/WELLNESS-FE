export type AuthCredentials = { email: string; password: string };

export interface AuthApi {
  signIn(credentials: AuthCredentials): Promise<{ userId: string }>;
  signUp(credentials: AuthCredentials): Promise<{ userId: string }>;
}

class MockAuthApi implements AuthApi {
  async signIn(credentials: AuthCredentials) {
    if (!credentials.email.includes('@') || credentials.password.length < 8) throw new Error('이메일과 8자 이상의 비밀번호를 확인해 주세요.');
    return { userId: 'mock-user' };
  }
  async signUp(credentials: AuthCredentials) {
    if (!credentials.email.includes('@') || credentials.password.length < 8) throw new Error('가입 정보를 확인해 주세요.');
    return { userId: 'mock-user' };
  }
}

export const authApi: AuthApi = new MockAuthApi();
