"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to watchlist by default
    router.replace("/dashboard/my-alerts");
  }, [router]);

  return null;
}
