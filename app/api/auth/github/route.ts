import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const next = searchParams.get("next") || "/experiences";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // Development Fallback: If credentials are not yet configured in .env,
  // notify user with helpful configuration instructions.
  if (!clientId || !clientSecret) {
    const returnUrl = new URL("/login", appUrl);
    returnUrl.searchParams.set(
      "oauth_notice",
      "GitHub OAuth credentials (GITHUB_CLIENT_ID) are not configured in .env. Please sign in with your email or configure GitHub OAuth App credentials."
    );
    return NextResponse.redirect(returnUrl);
  }

  const state = crypto.randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });
  cookieStore.set("oauth_next", next, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  const redirectUri = `${appUrl}/api/auth/github/callback`;
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "read:user user:email");
  githubAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(githubAuthUrl.toString());
}
