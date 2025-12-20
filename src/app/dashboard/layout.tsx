"use client";

import { Box } from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { DashboardSidebar } from "../components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      backgroundColor="gray.950"
    >
      <Navbar />
      <Box flex={1} display="flex">
        <DashboardSidebar />
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
