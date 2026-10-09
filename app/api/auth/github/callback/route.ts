import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  const cookieStore = await cookies();
  const savedState = cookieStore.get("github_oauth_state")?.value;
  const next = cookieStore.get("oauth_next")?.value || "/experiences";

  cookieStore.delete("github_oauth_state");
  cookieStore.delete("oauth_next");

  if (error || !code || !state || state !== savedState) {
    console.error("GitHub OAuth error or state mismatch:", { error, errorDescription, state, savedState });
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set(
      "error",
      errorDescription || "GitHub authentication was cancelled or failed security verification."
    );
    return NextResponse.redirect(errorUrl);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/github/callback`;

  try {
    // 1. Exchange authorization code for GitHub access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "ThePrepRoom-Auth",
      },
      body: JSON.stringify({
        client_id: clientId || "",
        client_secret: clientSecret || "",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("GitHub token exchange failed:", errBody);
      throw new Error(`Failed to exchange GitHub OAuth code: ${errBody}`);
    }

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error("GitHub token response returned error:", tokenData);
      throw new Error(tokenData.error_description || tokenData.error || "GitHub token exchange failed.");
    }

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      throw new Error("No access token received from GitHub.");
    }

    // 2. Fetch user profile from GitHub API
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ThePrepRoom-Auth",
      },
    });

    if (!userRes.ok) {
      const errBody = await userRes.text();
      console.error("GitHub user info fetch failed:", errBody);
      throw new Error(`Failed to fetch GitHub profile: ${errBody}`);
    }

    const profile = await userRes.json();
    const githubId = profile.id ? String(profile.id) : undefined;
    let email: string | undefined = profile.email?.toLowerCase().trim();
    const name: string = profile.name || profile.login || "Student";
    const picture: string | undefined = profile.avatar_url;

    // 3. GitHub users frequently have private emails; query /user/emails for primary verified address
    if (!email) {
      try {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "ThePrepRoom-Auth",
          },
        });

        if (emailsRes.ok) {
          const emails: Array<{
            email: string;
            primary: boolean;
            verified: boolean;
            visibility: string | null;
          }> = await emailsRes.json();

          const primaryVerified = emails.find((e) => e.primary && e.verified)?.email;
          const anyVerified = emails.find((e) => e.verified)?.email;
          const anyPrimary = emails.find((e) => e.primary)?.email;
          const fallback = emails[0]?.email;

          email = (primaryVerified || anyVerified || anyPrimary || fallback)?.toLowerCase().trim();
        }
      } catch (emailErr) {
        console.warn("GitHub user emails fetch error:", emailErr);
      }
    }

    if (!email) {
      throw new Error("No verified email received from GitHub account. Please ensure your GitHub account has a verified email address.");
    }

    // 4. Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // If user is an admin, prevent OAuth login to avoid bypassing 2FA
      if (user.role === "ADMIN") {
        const adminUrl = new URL("/admin/login", appUrl);
        adminUrl.searchParams.set(
          "error",
          "Administrator accounts must authenticate with email, password, and TOTP 2FA. Social login is disabled for admins."
        );
        return NextResponse.redirect(adminUrl);
      }

      // Link GitHub account and update avatar if not set
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: "github",
          oauthId: githubId || user.oauthId,
          image: user.image || picture || null,
        },
      });
    } else {
      // Create new student user
      const college = await prisma.college.findFirst();
      user = await prisma.user.create({
        data: {
          email,
          name: name || "Student",
          role: "STUDENT",
          oauthProvider: "github",
          oauthId: githubId || null,
          image: picture || null,
          collegeId: college?.id || null,
        },
      });
    }

    // 5. Create secure session cookie for student
    await createSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      authMethod: "github",
    });

    const destination = new URL(next, appUrl);
    return NextResponse.redirect(destination);
  } catch (err: unknown) {
    console.error("GitHub OAuth callback error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to sign in with GitHub. Please try again or use college email.";
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set("error", message);
    return NextResponse.redirect(errorUrl);
  }
}
