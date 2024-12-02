export interface AuthenticatedUser {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

