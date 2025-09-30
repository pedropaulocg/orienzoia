export type LoginInput = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TokenPayload = {
  sub: string; // user ID
  role: string;
  iat?: number;
  exp?: number;
};

export type RefreshTokenInput = {
  refreshToken: string;
};
