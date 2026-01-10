"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { useAuth } from "../providers/AuthContext";
import { DashboardNavbar } from "./components/DashboardNavbar";
import { UserProvider } from "../providers/UserContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isConnected, currentUser, isAuthenticating, accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardRoot = pathname === "/dashboard";
  const isSignIn = pathname === "/dashboard/signin";

  useEffect(() => {
    // Only redirect when authentication is complete (!isAuthenticating)
    if (!isAuthenticating) {
      // If there's no token, redirect to signin (currentUser will be undefined when query is skipped)
      if (!accessToken) {
        if (!isSignIn) router.replace("/dashboard/signin");
      } else {
        // Token exists - check the query result
        // currentUser will be undefined while loading, null if invalid, or user object if valid
        if (currentUser !== undefined) {
          if (currentUser && (isDashboardRoot || isSignIn)) {
            router.replace("/dashboard/alerts");
          } else if (!currentUser) {
            router.replace("/dashboard/signin");
          }
        }
      }
    }
  }, [isConnected, currentUser, pathname, isAuthenticating, accessToken, router, isDashboardRoot, isSignIn]);

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden" backgroundColor="gray.950">
      <DashboardNavbar />
      <Box flex={1} display="flex" overflow="hidden">
        {currentUser && !isDashboardRoot && <DashboardSidebar />}
        <Box flex={1} overflowY="auto">
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserProvider>
  );
}
