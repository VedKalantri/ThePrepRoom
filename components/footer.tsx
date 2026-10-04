"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Send, Check } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="border-t border-stone-200 dark:border-zinc-800/80 bg-stone-50/70 dark:bg-[#07080a] text-slate-600 dark:text-zinc-400 mt-auto transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Description (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white p-0.5">
                <Image
                  src="/logo.png"
                  alt="ThePrepRoom Logo"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
              <span className="font-heading font-black tracking-tight text-slate-900 dark:text-white text-lg sm:text-xl">
                The<span className="text-blue-500">PrepRoom</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm">
              Empowering students with real interview experiences and practical insights from top candidates at leading tech companies. Your roadmap to dream jobs.
            </p>

            <div className="text-[11px] text-slate-500 dark:text-zinc-500">
              Student placement knowledge initiative. All experiences are verified and community-reported.
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/experiences" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Interviews
                </Link>
              </li>
              <li>
                <Link href="/questions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Question Bank
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Companies
                </Link>
              </li>
              <li>
                <Link href="/prepare" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Preparation Hub
                </Link>
              </li>
              <li>
                <Link href="/share" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Share Experience
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Info (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
              Contact & Info
            </h4>
            <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span>
                  Campus Placement Knowledge Base,
                  <br />
                  Engineering College Campus, India
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="font-mono text-[11px] select-all">
                  thepreproom.contact@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Stay Updated Newsletter (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
              Stay Updated
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Get the latest interview experiences and placement tips delivered straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suppressHydrationWarning
                placeholder="Enter your email"
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 py-2.5 pl-3.5 pr-10 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-hidden transition-all shadow-xs"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all hover:scale-105 active:scale-95"
                aria-label="Subscribe"
              >
                {subscribed ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Thank you! You're subscribed to placement updates.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-200 dark:border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} ThePrepRoom. Learn from the interviews that came before you.</p>
          <div className="flex items-center space-x-6">
            <Link href="/experiences" className="hover:text-slate-900 dark:hover:text-zinc-200 transition-colors">
              Explore Experiences
            </Link>
            <span>•</span>
            <Link href="/prepare" className="hover:text-slate-900 dark:hover:text-zinc-200 transition-colors">
              Preparation Roadmaps
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
