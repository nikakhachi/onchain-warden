"use client";

import { Box, HStack, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "../Button";
import { OnchainWatcherIcon } from "../../icons/OnchainWatcherIcon";

const handleSmoothScroll = (e: React.MouseEvent<HTMLElement>, href: string) => {
  if (href.startsWith("#")) {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // Account for sticky navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }
};

const NavItem = ({ sectionId, label }: { sectionId: string; label: string }) => (
  <Box
    as="button"
    onClick={(e: React.MouseEvent<HTMLElement>) => handleSmoothScroll(e, sectionId)}
    color="gray.400"
    fontSize="sm"
    cursor="pointer"
    transition="color 0.2s"
    background="none"
    border="none"
    padding={0}
    _hover={{ color: "white" }}
  >
    {label}
  </Box>
);

export function Navbar() {
  return (
    <>
      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex={1000}
        borderBottomWidth="1px"
        borderBottomColor="gray.800"
        backdropFilter="blur(10px)"
        backgroundColor="gray.950"
      >
        <HStack paddingY={4} paddingX={6} justifyContent="space-between" alignItems="center">
          <Link href="/" style={{ textDecoration: "none" }}>
            <HStack gap={2} alignItems="center">
              <OnchainWatcherIcon width="40px" height="40px" />
              <Heading as="h1" fontSize="xl" color="white" fontWeight="600">
                Onchain Warden
              </Heading>
            </HStack>
          </Link>

          <HStack gap={8}>
            <HStack gap={8} alignItems="center" flex={1} justifyContent="center">
              <NavItem sectionId="#how-it-works" label="How it Works" />
              <NavItem sectionId="#templates" label="Use Cases" />
              <NavItem sectionId="#pricing" label="Pricing" />
              <NavItem sectionId="#faq" label="FAQ" />
            </HStack>
            <HStack gap={4} alignItems="center">
              <Link href="/dashboard/alerts" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="sm">
                  Dashboard
                </Button>
              </Link>
            </HStack>
          </HStack>
        </HStack>
      </Box>
    </>
  );
}
