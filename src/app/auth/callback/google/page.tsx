"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { TOKEN_STORAGE_KEY, TOKEN_EXPIRES_KEY } from "@/app/providers/AuthContext";
import { LoadingScreen } from "@/app/dashboard/components/LoadingScreen";
import { Box } from "@chakra-ui/react";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    // @ts-ignore
    if (session?.convexAccessToken && session?.convexExpiresAt) {
      // @ts-ignore
      localStorage.setItem(TOKEN_STORAGE_KEY, session.convexAccessToken);
      // @ts-ignore
      localStorage.setItem(TOKEN_EXPIRES_KEY, session.convexExpiresAt.toString());

      router.push("/dashboard/my-alerts");
    }
  }, [sessionStatus, session, router, searchParams]);

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden" backgroundColor="gray.950">
      <LoadingScreen />
    </Box>
  );
}
