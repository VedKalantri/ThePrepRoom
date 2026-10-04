"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, ArrowRight } from "lucide-react";
import { getUserInitials } from "@/lib/user-utils";

interface StoryItem {
  id: string;
  slug: string;
  interviewYear: number;
  overallExperience: string;
  viewsCount: number;
  company: {
    name: string;
    slug: string;
  };
  role: {
    title: string;
  };
  user: {
    name: string;
    image?: string | null;
  } | null;
  isAnonymous: boolean;
}

interface TopStoriesCarouselProps {
  stories: StoryItem[];
}

export function TopStoriesCarousel({ stories }: TopStoriesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      {/* Slider Controls (desktop overlay buttons) */}
      <div className="hidden sm:flex items-center gap-2 absolute -top-12 right-0 z-10">
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => scroll("left")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all duration-250 ease-out hover:scale-105 active:scale-95 shadow-xs"
          aria-label="Previous story"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => scroll("right")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all duration-250 ease-out hover:scale-105 active:scale-95 shadow-xs"
          aria-label="Next story"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {stories.map((story, index) => {
          const rank = String(index + 1).padStart(2, "0");
          const authorName = story.isAnonymous ? "Anonymous Candidate" : story.user?.name || "Student";
          const authorInitials = getUserInitials(authorName);

          return (
            <Link
              key={story.id}
              href={`/experiences/${story.slug}`}
              className="flex-none w-[280px] sm:w-[320px] snap-start rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#121418] p-5 hover:border-blue-500/50 hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] transition-all duration-200 ease-out shadow-sm hover:shadow-xl hover:shadow-blue-950/30 group/card flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3">
                {/* Card Top: Rank and View Count */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-sm font-bold text-slate-400 dark:text-zinc-500 group-hover/card:text-blue-500 transition-colors">
                    {rank}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                    <Eye className="h-3 w-3" />
                    <span>{story.viewsCount > 1000 ? `${(story.viewsCount / 1000).toFixed(1)}k` : story.viewsCount}</span>
                  </div>
                </div>

                {/* Company & Role */}
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100 group-hover/card:text-blue-500 transition-colors leading-tight line-clamp-1">
                    {story.company.name} Interview Experience
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-1">
                    Role: <span className="text-slate-700 dark:text-zinc-300 font-medium">{story.role.title}</span> · Year {story.interviewYear}
                  </p>
                </div>

                {/* Narrative Snippet */}
                <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {story.overallExperience}
                </p>
              </div>

              {/* Author footer */}
              <div className="mt-5 pt-3.5 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs overflow-hidden">
                    {story.user?.image && !story.isAnonymous ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={story.user.image} alt={authorName} className="h-full w-full object-cover" />
                    ) : (
                      <span>{authorInitials}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-200 line-clamp-1 leading-none">
                      {authorName}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      {story.company.name} · {story.interviewYear}
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-slate-400 dark:text-zinc-600 group-hover/card:translate-x-1 group-hover/card:text-blue-500 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
