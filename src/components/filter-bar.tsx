"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CATEGORIES } from "@/lib/scoring/categorize";

const TIMEFRAMES = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "thisWeekend", label: "This Weekend" },
  { value: "nextWeek", label: "Next Week" },
  { value: "nextMonth", label: "Next Month" },
];

const SCOPES = [
  { value: "local", label: "Near Me" },
  { value: "sf", label: "SF" },
  { value: "northBay", label: "North Bay" },
  { value: "southBay", label: "South Bay" },
  { value: "bayArea", label: "Bay Area" },
  { value: "peninsula", label: "Peninsula" },
  { value: "eastBay", label: "East Bay" },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentScope = searchParams.get("scope") || "southBay";
  const currentTimeframe = searchParams.get("timeframe") || "thisWeekend";
  const currentCategory = searchParams.get("category") || "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-4">
      {/* Scope */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Location
        </label>
        <div className="flex flex-wrap gap-2">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => updateParam("scope", s.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                currentScope === s.value
                  ? "bg-accent text-white"
                  : "bg-category-pill text-foreground hover:bg-accent-light hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          When
        </label>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.value}
              onClick={() => updateParam("timeframe", t.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                currentTimeframe === t.value
                  ? "bg-accent text-white"
                  : "bg-category-pill text-foreground hover:bg-accent-light hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParam("category", "")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              !currentCategory
                ? "bg-accent text-white"
                : "bg-category-pill text-foreground hover:bg-accent-light hover:text-white"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => updateParam("category", c)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                currentCategory === c
                  ? "bg-accent text-white"
                  : "bg-category-pill text-foreground hover:bg-accent-light hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
