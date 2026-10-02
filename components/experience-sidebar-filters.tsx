"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import {
  Filter,
  X,
  Check,
  Building2,
  Briefcase,
  Calendar,
  Layers,
  ChevronDown,
  Search,
} from "lucide-react";
import { fuzzyFilterAndSort } from "@/lib/fuzzy-search";

interface CompanyWithCount {
  name: string;
  slug: string;
  _count?: {
    experiences: number;
  };
}

interface RoleWithCount {
  title: string;
  slug: string;
  _count?: {
    experiences: number;
  };
}

interface ExperienceSidebarFiltersProps {
  companies: CompanyWithCount[];
  roles: RoleWithCount[];
  years: number[];
  initialFilters: {
    companySlug?: string;
    roleSlug?: string;
    interviewYear?: string;
    placementType?: string;
    roundType?: string;
    result?: string;
  };
}

const PLACEMENT_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "CAMPUS", label: "Campus Placement" },
  { value: "OFF_CAMPUS", label: "Off-Campus" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "REFERRAL", label: "Referral" },
];

const ROUND_OPTIONS = [
  { value: "ALL", label: "Any Round" },
  { value: "ONLINE_ASSESSMENT", label: "Online Assessment (OA)" },
  { value: "TECHNICAL", label: "Technical Interview" },
  { value: "HR", label: "HR Interview" },
  { value: "GROUP_DISCUSSION", label: "Group Discussion" },
  { value: "APTITUDE", label: "Aptitude Test" },
];

export function ExperienceSidebarFilters({
  companies,
  roles,
  years,
  initialFilters,
}: ExperienceSidebarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Active single-open dropdown window
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-scroll newly opened dropdown into full view if needed
  useEffect(() => {
    if (openDropdown && activeDropdownRef.current) {
      const timer = setTimeout(() => {
        activeDropdownRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [openDropdown]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Active filter params
  const rawCompanyParam = searchParams.get("company") ?? initialFilters.companySlug ?? "";
  const selectedCompanySlugs = useMemo(() => {
    if (!rawCompanyParam || rawCompanyParam === "ALL") return [];
    return rawCompanyParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rawCompanyParam]);

  const rawRoleParam = searchParams.get("role") ?? initialFilters.roleSlug ?? "";
  const selectedRoleSlugs = useMemo(() => {
    if (!rawRoleParam || rawRoleParam === "ALL") return [];
    return rawRoleParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [rawRoleParam]);

  const currentPlacement = searchParams.get("placement") || initialFilters.placementType || "ALL";
  const currentYear = searchParams.get("year") || initialFilters.interviewYear || "ALL";
  const currentRound = searchParams.get("round") || initialFilters.roundType || "ALL";

  // Search feature states inside dropdowns
  const [companySearch, setCompanySearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    return fuzzyFilterAndSort(companies, companySearch, (c) => c.name);
  }, [companies, companySearch]);

  const filteredRoles = useMemo(() => {
    return fuzzyFilterAndSort(roles, roleSearch, (r) => r.title);
  }, [roles, roleSearch]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset pagination

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Multi-select toggle for companies
  const toggleCompanySlug = (slug: string) => {
    const isSelected = selectedCompanySlugs.includes(slug);
    const updated = isSelected
      ? selectedCompanySlugs.filter((s) => s !== slug)
      : [...selectedCompanySlugs, slug];

    updateParam("company", updated.length > 0 ? updated.join(",") : "");
  };

  const clearCompanies = () => {
    updateParam("company", "");
  };

  // Multi-select toggle for roles
  const toggleRoleSlug = (slug: string) => {
    const isSelected = selectedRoleSlugs.includes(slug);
    const updated = isSelected
      ? selectedRoleSlugs.filter((s) => s !== slug)
      : [...selectedRoleSlugs, slug];

    updateParam("role", updated.length > 0 ? updated.join(",") : "");
  };

  const clearRoles = () => {
    updateParam("role", "");
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);

    startTransition(() => {
      router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const activeFiltersCount = [
    selectedCompanySlugs.length > 0,
    selectedRoleSlugs.length > 0,
    currentPlacement !== "ALL",
    currentYear !== "ALL",
    currentRound !== "ALL",
  ].filter(Boolean).length;

  // Selected label helpers for dropdown headings
  const companyLabel = useMemo(() => {
    if (selectedCompanySlugs.length === 0) return null;
    if (selectedCompanySlugs.length === 1) {
      return (
        companies.find((c) => c.slug === selectedCompanySlugs[0])?.name ||
        selectedCompanySlugs[0]
      );
    }
    return `${selectedCompanySlugs.length} selected`;
  }, [selectedCompanySlugs, companies]);

  const roleLabel = useMemo(() => {
    if (selectedRoleSlugs.length === 0) return null;
    if (selectedRoleSlugs.length === 1) {
      return (
        roles.find((r) => r.slug === selectedRoleSlugs[0])?.title ||
        selectedRoleSlugs[0]
      );
    }
    return `${selectedRoleSlugs.length} selected`;
  }, [selectedRoleSlugs, roles]);

  const placementLabel =
    currentPlacement === "ALL"
      ? null
      : PLACEMENT_OPTIONS.find((p) => p.value === currentPlacement)?.label;

  const roundLabel =
    currentRound === "ALL"
      ? null
      : ROUND_OPTIONS.find((r) => r.value === currentRound)?.label;

  return (
    <div className="space-y-4 pb-16">
      <div
        ref={containerRef}
        className="relative bg-[#111317] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors space-y-4"
      >
      {/* Sidebar Header / Mobile Toggle Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="flex items-center gap-2 outline-none lg:pointer-events-none w-full lg:w-auto justify-between lg:justify-start group"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Filter className="h-4 w-4" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-white tracking-tight">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="text-[11px] font-mono text-blue-400 font-medium">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
          </div>

          <div className="lg:hidden text-zinc-400 flex items-center gap-1.5 text-xs">
            <span>{isMobileOpen ? "Hide" : "Show"}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                isMobileOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            disabled={isPending}
            className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-zinc-800/70 transition-colors outline-none shrink-0"
          >
            <X className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Filter Sections (Always visible on lg, toggled on mobile) */}
      <div className={`space-y-2.5 pt-1 ${isMobileOpen ? "block" : "hidden lg:block"}`}>
        {/* 1. COMPANY DROPDOWN WITH WINDOW & SEARCH & MULTI-SELECT */}
        <div
          ref={openDropdown === "company" ? activeDropdownRef : undefined}
          className={`relative ${openDropdown === "company" ? "z-30" : "z-10"}`}
        >
          <button
            type="button"
            onClick={() => toggleDropdown("company")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium tracking-normal transition-all duration-200 outline-none select-none group ${
              selectedCompanySlugs.length > 0
                ? "border-blue-500/50 bg-blue-500/10 text-white shadow-xs shadow-blue-500/10"
                : openDropdown === "company"
                ? "border-zinc-700 bg-[#181a24] text-white shadow-sm"
                : "border-zinc-800/80 bg-[#14161e] text-zinc-300 hover:text-white hover:border-zinc-700/80 hover:bg-[#181a24]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-1.5 rounded-lg shrink-0 transition-colors duration-200 ${
                  selectedCompanySlugs.length > 0
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-300"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                Company
              </span>
              {selectedCompanySlugs.length > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-blue-500/25 text-blue-300 border border-blue-500/40 shrink-0">
                  {selectedCompanySlugs.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              {companyLabel && (
                <span className="max-w-[95px] sm:max-w-[110px] truncate text-[11px] font-normal text-blue-300/90 bg-blue-500/15 px-1.5 py-0.5 rounded">
                  {companyLabel}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) shrink-0 ${
                  openDropdown === "company" ? "rotate-180 text-blue-400" : "group-hover:text-zinc-300"
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Window with Smooth Animation */}
          {openDropdown === "company" && (
            <div className="animate-popover mt-2 rounded-2xl border border-zinc-700/80 bg-[#12141c]/95 backdrop-blur-2xl p-3.5 shadow-2xl shadow-black/80 ring-1 ring-white/10 space-y-2.5">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200">Select Companies</span>
                  {selectedCompanySlugs.length > 0 && (
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.2 rounded-full font-medium">
                      {selectedCompanySlugs.length} selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Search Bar inside Window */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  suppressHydrationWarning
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full rounded-xl border border-zinc-700/70 bg-[#0c0d12] py-1.5 pl-8 pr-7 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 focus:outline-none transition-all duration-150"
                />
                {companySearch && (
                  <button
                    type="button"
                    onClick={() => setCompanySearch("")}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Info Bar */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
                <span>{filteredCompanies.length} available</span>
                {selectedCompanySlugs.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCompanies}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Scrollable Company List with Multi-Select Checkboxes */}
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {filteredCompanies.length === 0 ? (
                  <div className="py-4 text-center text-xs text-zinc-500">No companies found</div>
                ) : (
                  filteredCompanies.map((c) => {
                    const isChecked = selectedCompanySlugs.includes(c.slug);
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => toggleCompanySlug(c.slug)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all duration-150 text-left group ${
                          isChecked
                            ? "bg-blue-500/15 border border-blue-500/35 text-white font-medium"
                            : "hover:bg-zinc-800/60 text-zinc-300 hover:text-white border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`h-4 w-4 rounded flex items-center justify-center transition-all duration-150 shrink-0 ${
                              isChecked
                                ? "bg-blue-600 border border-blue-500 text-white shadow-xs shadow-blue-500/30"
                                : "border border-zinc-600/90 bg-zinc-800/80 group-hover:border-zinc-500"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[2.5]" />}
                          </div>
                          <span className="truncate">{c.name}</span>
                        </div>
                        {c._count?.experiences !== undefined && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/90 px-1.5 py-0.5 rounded border border-zinc-700/40 shrink-0">
                            {c._count.experiences}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Window Footer Actions */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={clearCompanies}
                  disabled={selectedCompanySlugs.length === 0}
                  className="text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all duration-150"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. JOB ROLE DROPDOWN WITH WINDOW & SEARCH & MULTI-SELECT */}
        <div
          ref={openDropdown === "role" ? activeDropdownRef : undefined}
          className={`relative ${openDropdown === "role" ? "z-30" : "z-10"}`}
        >
          <button
            type="button"
            onClick={() => toggleDropdown("role")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium tracking-normal transition-all duration-200 outline-none select-none group ${
              selectedRoleSlugs.length > 0
                ? "border-blue-500/50 bg-blue-500/10 text-white shadow-xs shadow-blue-500/10"
                : openDropdown === "role"
                ? "border-zinc-700 bg-[#181a24] text-white shadow-sm"
                : "border-zinc-800/80 bg-[#14161e] text-zinc-300 hover:text-white hover:border-zinc-700/80 hover:bg-[#181a24]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-1.5 rounded-lg shrink-0 transition-colors duration-200 ${
                  selectedRoleSlugs.length > 0
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-300"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                Job Role
              </span>
              {selectedRoleSlugs.length > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-blue-500/25 text-blue-300 border border-blue-500/40 shrink-0">
                  {selectedRoleSlugs.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              {roleLabel && (
                <span className="max-w-[95px] sm:max-w-[110px] truncate text-[11px] font-normal text-blue-300/90 bg-blue-500/15 px-1.5 py-0.5 rounded">
                  {roleLabel}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) shrink-0 ${
                  openDropdown === "role" ? "rotate-180 text-blue-400" : "group-hover:text-zinc-300"
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Window with Smooth Animation */}
          {openDropdown === "role" && (
            <div className="animate-popover mt-2 rounded-2xl border border-zinc-700/80 bg-[#12141c]/95 backdrop-blur-2xl p-3.5 shadow-2xl shadow-black/80 ring-1 ring-white/10 space-y-2.5">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200">Select Roles</span>
                  {selectedRoleSlugs.length > 0 && (
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.2 rounded-full font-medium">
                      {selectedRoleSlugs.length} selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Search Bar inside Window */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  suppressHydrationWarning
                  type="text"
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  placeholder="Search roles (e.g. SDE, Analyst)..."
                  className="w-full rounded-xl border border-zinc-700/70 bg-[#0c0d12] py-1.5 pl-8 pr-7 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 focus:outline-none transition-all duration-150"
                />
                {roleSearch && (
                  <button
                    type="button"
                    onClick={() => setRoleSearch("")}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Info Bar */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
                <span>{filteredRoles.length} available</span>
                {selectedRoleSlugs.length > 0 && (
                  <button
                    type="button"
                    onClick={clearRoles}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Scrollable Role List with Checkboxes */}
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {filteredRoles.length === 0 ? (
                  <div className="py-4 text-center text-xs text-zinc-500">No roles found</div>
                ) : (
                  filteredRoles.map((r) => {
                    const isChecked = selectedRoleSlugs.includes(r.slug);
                    return (
                      <button
                        key={r.slug}
                        type="button"
                        onClick={() => toggleRoleSlug(r.slug)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all duration-150 text-left group ${
                          isChecked
                            ? "bg-blue-500/15 border border-blue-500/35 text-white font-medium"
                            : "hover:bg-zinc-800/60 text-zinc-300 hover:text-white border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`h-4 w-4 rounded flex items-center justify-center transition-all duration-150 shrink-0 ${
                              isChecked
                                ? "bg-blue-600 border border-blue-500 text-white shadow-xs shadow-blue-500/30"
                                : "border border-zinc-600/90 bg-zinc-800/80 group-hover:border-zinc-500"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[2.5]" />}
                          </div>
                          <span className="truncate">{r.title}</span>
                        </div>
                        {r._count?.experiences !== undefined && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/90 px-1.5 py-0.5 rounded border border-zinc-700/40 shrink-0">
                            {r._count.experiences}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Window Footer Actions */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={clearRoles}
                  disabled={selectedRoleSlugs.length === 0}
                  className="text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all duration-150"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. PLACEMENT TYPE DROPDOWN WITH WINDOW */}
        <div
          ref={openDropdown === "placement" ? activeDropdownRef : undefined}
          className={`relative ${openDropdown === "placement" ? "z-30" : "z-10"}`}
        >
          <button
            type="button"
            onClick={() => toggleDropdown("placement")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium tracking-normal transition-all duration-200 outline-none select-none group ${
              currentPlacement !== "ALL"
                ? "border-blue-500/50 bg-blue-500/10 text-white shadow-xs shadow-blue-500/10"
                : openDropdown === "placement"
                ? "border-zinc-700 bg-[#181a24] text-white shadow-sm"
                : "border-zinc-800/80 bg-[#14161e] text-zinc-300 hover:text-white hover:border-zinc-700/80 hover:bg-[#181a24]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-1.5 rounded-lg shrink-0 transition-colors duration-200 ${
                  currentPlacement !== "ALL"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-300"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                Placement Type
              </span>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              {placementLabel && (
                <span className="max-w-[95px] sm:max-w-[110px] truncate text-[11px] font-normal text-blue-300/90 bg-blue-500/15 px-1.5 py-0.5 rounded">
                  {placementLabel}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) shrink-0 ${
                  openDropdown === "placement" ? "rotate-180 text-blue-400" : "group-hover:text-zinc-300"
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Window with Smooth Animation */}
          {openDropdown === "placement" && (
            <div className="animate-popover mt-2 rounded-2xl border border-zinc-700/80 bg-[#12141c]/95 backdrop-blur-2xl p-3.5 shadow-2xl shadow-black/80 ring-1 ring-white/10 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-xs font-semibold text-zinc-200">Select Placement Type</span>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {PLACEMENT_OPTIONS.map((opt) => {
                  const isSelected = currentPlacement === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        updateParam("placement", opt.value);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all duration-150 text-left ${
                        isSelected
                          ? "bg-blue-500/15 border border-blue-500/35 text-blue-300 font-medium"
                          : "text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    updateParam("placement", "ALL");
                    setOpenDropdown(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all duration-150"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. INTERVIEW YEAR DROPDOWN WITH WINDOW */}
        <div
          ref={openDropdown === "year" ? activeDropdownRef : undefined}
          className={`relative ${openDropdown === "year" ? "z-30" : "z-10"}`}
        >
          <button
            type="button"
            onClick={() => toggleDropdown("year")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium tracking-normal transition-all duration-200 outline-none select-none group ${
              currentYear !== "ALL"
                ? "border-blue-500/50 bg-blue-500/10 text-white shadow-xs shadow-blue-500/10"
                : openDropdown === "year"
                ? "border-zinc-700 bg-[#181a24] text-white shadow-sm"
                : "border-zinc-800/80 bg-[#14161e] text-zinc-300 hover:text-white hover:border-zinc-700/80 hover:bg-[#181a24]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-1.5 rounded-lg shrink-0 transition-colors duration-200 ${
                  currentYear !== "ALL"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-300"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                Interview Year
              </span>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              {currentYear !== "ALL" && (
                <span className="text-[11px] font-mono text-blue-300/90 bg-blue-500/15 px-1.5 py-0.5 rounded">
                  {currentYear}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) shrink-0 ${
                  openDropdown === "year" ? "rotate-180 text-blue-400" : "group-hover:text-zinc-300"
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Window with Smooth Animation */}
          {openDropdown === "year" && (
            <div className="animate-popover mt-2 rounded-2xl border border-zinc-700/80 bg-[#12141c]/95 backdrop-blur-2xl p-3.5 shadow-2xl shadow-black/80 ring-1 ring-white/10 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-xs font-semibold text-zinc-200">Select Year</span>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    updateParam("year", "ALL");
                    setOpenDropdown(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 ${
                    currentYear === "ALL"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                >
                  All Years
                </button>
                {years.map((y) => {
                  const isSelected = currentYear === y.toString();
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        updateParam("year", y.toString());
                        setOpenDropdown(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 ${
                        isSelected
                          ? "bg-blue-600 text-white font-semibold shadow-xs"
                          : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700"
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    updateParam("year", "ALL");
                    setOpenDropdown(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all duration-150"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. ROUNDS INCLUDED DROPDOWN WITH WINDOW */}
        <div
          ref={openDropdown === "round" ? activeDropdownRef : undefined}
          className={`relative ${openDropdown === "round" ? "z-30" : "z-10"}`}
        >
          <button
            type="button"
            onClick={() => toggleDropdown("round")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium tracking-normal transition-all duration-200 outline-none select-none group ${
              currentRound !== "ALL"
                ? "border-blue-500/50 bg-blue-500/10 text-white shadow-xs shadow-blue-500/10"
                : openDropdown === "round"
                ? "border-zinc-700 bg-[#181a24] text-white shadow-sm"
                : "border-zinc-800/80 bg-[#14161e] text-zinc-300 hover:text-white hover:border-zinc-700/80 hover:bg-[#181a24]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-1.5 rounded-lg shrink-0 transition-colors duration-200 ${
                  currentRound !== "ALL"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-300"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                Round Included
              </span>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              {roundLabel && (
                <span className="max-w-[95px] sm:max-w-[110px] truncate text-[11px] font-normal text-blue-300/90 bg-blue-500/15 px-1.5 py-0.5 rounded">
                  {roundLabel}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) shrink-0 ${
                  openDropdown === "round" ? "rotate-180 text-blue-400" : "group-hover:text-zinc-300"
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Window with Smooth Animation */}
          {openDropdown === "round" && (
            <div className="animate-popover mt-2 rounded-2xl border border-zinc-700/80 bg-[#12141c]/95 backdrop-blur-2xl p-3.5 shadow-2xl shadow-black/80 ring-1 ring-white/10 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-xs font-semibold text-zinc-200">Select Round Type</span>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {ROUND_OPTIONS.map((opt) => {
                  const isSelected = currentRound === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        updateParam("round", opt.value);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all duration-150 text-left ${
                        isSelected
                          ? "bg-blue-500/15 border border-blue-500/35 text-blue-300 font-medium"
                          : "text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent"
                      }`}
                    >
                      <span className="truncate pr-2">{opt.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    updateParam("round", "ALL");
                    setOpenDropdown(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(null)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all duration-150"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
