// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/signin",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/proposals/:path*",
    "/contractmatch/:path*",
    "/documents/:path*",
    "/capability/:path*",
    "/certifications/:path*",
    "/wins/:path*",
    "/opportunities/:path*",
    "/alerts/:path*",
    "/marketplaces/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};
