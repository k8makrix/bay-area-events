"use client";

import dynamic from "next/dynamic";

const BayAreaMap = dynamic(
  () => import("@/components/bay-area-map").then((m) => m.BayAreaMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse rounded-xl border border-card-border bg-card-bg sm:h-[350px] lg:h-[400px]" />
    ),
  }
);

export function BayAreaMapWrapper() {
  return <BayAreaMap />;
}
