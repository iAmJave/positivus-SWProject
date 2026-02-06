import { auth } from "@/types/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }

    if (req.auth.user?.role !== "admin") {
      return NextResponse.redirect(
        new URL("/unauthorized", req.nextUrl.origin)
      );
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
