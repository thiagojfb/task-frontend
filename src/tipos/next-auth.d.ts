import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    usuario?: string;
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiraEm: number;
    };
  }

  interface Session {
    usuario?: string;
    erro?: "RefreshFalhou";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    usuario?: string;
    accessToken?: string;
    refreshToken?: string;
    expiraEm?: number;
    erro?: "RefreshFalhou";
  }
}
