"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ScanResultRedirect() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    if (params?.id) router.replace(`/report/${params.id}`);
  }, [router, params]);
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
