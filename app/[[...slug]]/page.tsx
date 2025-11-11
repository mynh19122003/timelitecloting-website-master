"use client";

import dynamic from "next/dynamic";

// Note: generateStaticParams() is defined in layout.tsx (Server Component)
// It cannot be exported from Client Components ("use client")

const AppRoot = dynamic(() => import("../../src/AppRoot"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.3em] text-dark/70">
          Loading Timelite
        </p>
      </div>
    </div>
  ),
});

export default function CatchAllPage() {
  return <AppRoot />;
}
