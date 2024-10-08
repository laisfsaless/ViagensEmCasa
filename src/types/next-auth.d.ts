import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      username: string;
      image: string;
      verifiedEmail: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
    username: string;
    image: string;
    verifiedEmail: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    email: string;
    username: string;
    image: string;
    verifiedEmail: boolean;
  }
}
