"use client";

import dynamic from "next/dynamic";
import { Chef } from "../lib/types";

const ChefMap = dynamic(() => import("./ChefMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[500px] rounded-2xl bg-[var(--input)] animate-pulse flex items-center justify-center">
      <span className="text-[var(--text-muted)] text-sm">Loading map...</span>
    </div>
  ),
});

interface Props {
  chefs: Chef[];
  center: [number, number];
  radius: number;
}

export default function ChefMapWrapper(props: Props) {
  return <ChefMap {...props} />;
}
