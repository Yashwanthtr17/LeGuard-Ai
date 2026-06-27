"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HistoryRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/reports"); }, [router]);
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
