"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition, useRef } from "react";
import {
  PlusCircle,
  Bookmark,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { PLACEMENT_STATUS_CONFIG } from "@/lib/profile-constants";
import { UserAvatar } from "@/components/user-avatar";

interface NavbarProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string | null;
    graduationYear?: number | null;
    image?: string | null;
    placementStatus?: string | null;
    placedCompany?: string | null;
    linkedinUrl?: string | null;
  } | null;
}

export function Navbar({ currentUser: initialUser }: NavbarProps) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const handleProfileUpdated = (event: any) => {
      if (event.detail) {
        setCurrentUser((prev: any) => (prev ? { ...prev, ...event.detail } : prev));
      }
    };
    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("profile-updated", handleProfileUpdated);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  // Optimistic path highlight so navbar tab responds with 0ms delay on click
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const currentPath = optimisticPath || pathname;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Experiences", href: "/experiences" },
    { label: "Questions", href: "/questions" },
    { label: "Companies", href: "/companies" },
    { label: "Prepare", href: "/prepare" },
    { label: "About", href: "/about" },
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setUserMenuOpen(false);
      router.refresh();
    });
  };

  const statusKey = currentUser?.placementStatus || "PREPARING";
  const statusConfig = PLACEMENT_STATUS_CONFIG[statusKey] || PLACEMENT_STATUS_CONFIG.PREPARING;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#090a0d]/90 backdrop-blur-md transition-colors select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group outline-none focus:outline-none">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white p-0.5">
              <Image
                src="/logo.png"
                alt="ThePrepRoom Logo"
                width={36}
                height={36}
                className="h-full w-full object-contain"
                unoptimized
                priority
              />
            </div>
            <div className="flex items-baseline">
              <span className="font-heading font-black tracking-tight text-white text-lg sm:text-xl">
                The<span className="text-blue-500">PrepRoom</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? currentPath === "/" : currentPath.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setOptimisticPath(link.href)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-150 rounded-lg outline-none focus:outline-none focus-visible:outline-none border-0 ${
                    isActive
                      ? "text-blue-400 bg-blue-500/15 font-semibold"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 font-medium"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Share Experience Button */}
          <Link
            href="/share"
            prefetch={true}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ease-out hover:shadow-lg hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-600/20 outline-none focus:outline-none"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Share Experience</span>
          </Link>

          {/* User Account / Login */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              {/* Modern Glassmorphic Trigger Chip */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-3 transition-all duration-200 outline-none cursor-pointer group active:scale-95 ${
                  userMenuOpen
                    ? "border-blue-500/50 bg-[#161922] shadow-lg shadow-blue-500/10"
                    : "border-zinc-800/90 bg-[#111317]/90 hover:border-zinc-700 hover:bg-[#161820]"
                }`}
              >
                {/* Avatar with Gradient Ring & 2-letter Initials Fallback */}
                <UserAvatar
                  name={currentUser.name}
                  image={currentUser.image}
                  size="sm"
                  statusDotColor={statusConfig.dotColor}
                />

                {/* Name */}
                <span className="hidden md:inline max-w-[120px] truncate text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors">
                  {currentUser.name}
                </span>

                {/* Admin Chip */}
                {currentUser.role === "ADMIN" && (
                  <span className="hidden md:inline rounded-full bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                    Admin
                  </span>
                )}

                {/* Smooth Rotating Chevron */}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180 text-blue-400" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                />
              </button>

              {/* Modern Snappy Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-zinc-800 bg-[#121418] shadow-2xl shadow-black/80 p-2 z-50 animate-popover">
                  {/* User Profile Header Card inside Dropdown */}
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="block p-3 rounded-xl bg-[#16181f] border border-zinc-800/80 hover:border-zinc-700/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={currentUser.name}
                        image={currentUser.image}
                        size="md"
                      />

                      <div className="space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {currentUser.name}
                          </p>
                          <ExternalLink className="h-3 w-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate font-mono">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill in Menu Header */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                      <div className="inline-flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor} animate-pulse`} />
                        <span className={`font-semibold ${statusConfig.textColor}`}>
                          {statusKey === "OFFER_ACCEPTED" && currentUser.placedCompany
                            ? currentUser.placedCompany
                            : statusConfig.shortLabel}
                        </span>
                      </div>

                      {currentUser.department && (
                        <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                          {currentUser.department}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Navigation Links */}
                  <div className="py-1 space-y-0.5 text-xs">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-colors outline-none group"
                    >
                      <User className="h-4 w-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs">My Profile</span>
                        <span className="text-[10px] text-zinc-500 leading-tight">
                          Edit information, status & bio
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/bookmarks"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-colors outline-none group"
                    >
                      <Bookmark className="h-4 w-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs">Saved Bookmarks</span>
                        <span className="text-[10px] text-zinc-500 leading-tight">
                          Access your saved experiences
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/share"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-colors outline-none group"
                    >
                      <PlusCircle className="h-4 w-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs">Share Experience</span>
                        <span className="text-[10px] text-zinc-500 leading-tight">
                          Post interview questions & tips
                        </span>
                      </div>
                    </Link>

                    {currentUser.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors outline-none group border border-emerald-500/20"
                      >
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">Admin Moderation</span>
                          <span className="text-[10px] text-emerald-400/70 leading-tight">
                            Manage submission queues
                          </span>
                        </div>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-zinc-800/80 my-1" />

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleLogout}
                    disabled={isPending}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left outline-none cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isPending ? "Signing Out..." : "Sign Out"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-xs sm:text-sm font-medium text-white px-3.5 py-1.5 transition-colors outline-none"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 bg-[#090a0d] px-4 pt-3 pb-6 md:hidden">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? currentPath === "/" : currentPath.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onClick={() => {
                    setOptimisticPath(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium border-0 outline-none ${
                    isActive
                      ? "bg-blue-500/15 font-semibold text-blue-400"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/share"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 outline-none"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Share Experience</span>
            </Link>

            {currentUser ? (
              <div className="pt-3 border-t border-zinc-800 mt-2 space-y-1">
                {currentUser.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded-lg font-semibold"
                  >
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span>Admin Moderation</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white"
                >
                  <User className="h-4 w-4 text-blue-400" />
                  <span>My Profile ({currentUser.name})</span>
                </Link>
                <Link
                  href="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white"
                >
                  <Bookmark className="h-4 w-4 text-zinc-400" />
                  <span>Saved Bookmarks</span>
                </Link>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-zinc-800 mt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full rounded-lg bg-zinc-800 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
