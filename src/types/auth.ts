import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { checkRateLimit, getRateLimitConfig } from "@/lib/rate-limit";
import { auditLogs } from "@/lib/db/db";
import { headers } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Token {
  role?: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  sub?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate inputs
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // Rate limiting - strict: 5 login attempts per minute per email
        const config = getRateLimitConfig('login');
        const { allowed } = await checkRateLimit(`login:${credentials.email}`, config);
        
        if (!allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        // Query database
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, password_hash, role")
          .eq("email", credentials.email)
          .single();

        if (error || !user) {
          throw new Error("Invalid email or password");
        }

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        const h = await headers();

        const ip =
          h.get("x-forwarded-for") ||
          h.get("x-real-ip") ||
          "unknown";

        const userAgent = h.get("user-agent");

        await auditLogs.create({
          admin_user_id: user.id,
          admin_email: user.email!,
          action: "login",
          resource_type: "USER",
          resource_id: user.id,
          resource_name: user.email,
          changes: null,
          ip_address: ip,
          user_agent: userAgent,
        });

        // Return minimal user object
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as Token;
      const expiringIn = Date.now() + 15 * 60 * 1000; // 15 min
       if (user) {
        t.sub = user.id;
        t.role = user.role;
        t.accessTokenExpires = expiringIn;
        t.refreshToken = crypto.randomUUID();
      }
      if (Date.now() > (t.accessTokenExpires || 0)) {
        const newAccessTokenExpires = expiringIn;
        t.accessTokenExpires = newAccessTokenExpires;
      }

      return token;
    },
    async session({ session, token }) {
        const t = token as Token;
      if (session.user) {
        if (!t.sub) throw new Error("Token missing sub");
        session.user.id = t.sub;
        (session.user as any).role = token.role;
        (session as any).accessTokenExpires = token.accessTokenExpires;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});
