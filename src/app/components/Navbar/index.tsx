"use client";

import { usePathname } from "next/navigation";
import { Box, HStack, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "../Button";
import { OnchainWatcherIcon } from "../../icons/OnchainWatcherIcon";
import { useWallet } from "../../providers/WalletContext";
import { useUser } from "../../providers/UserContext";
import { AccountSection } from "../DashboardSidebar/AccountSection";
import { LoginModal } from "../AuthModals/LoginModal";
import { SignUpModal } from "../AuthModals/SignUpModal";
import { useDisclosure } from "@chakra-ui/react";

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
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isDashboard = pathname?.startsWith("/dashboard");
  const { hasValidToken } = useWallet();
  const { currentUser } = useUser();
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const { isOpen: isSignUpOpen, onOpen: onSignUpOpen, onClose: onSignUpClose } = useDisclosure();

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

          {isLandingPage && (
            <HStack gap={8}>
              <HStack gap={8} alignItems="center" flex={1} justifyContent="center">
                <NavItem sectionId="#how-it-works" label="How it Works" />
                <NavItem sectionId="#templates" label="Use Cases" />
                <NavItem sectionId="#metrics" label="Features" />
                <NavItem sectionId="#faq" label="FAQ" />
              </HStack>
              <HStack gap={4} alignItems="center">
                {hasValidToken ? (
                  <Link href="/dashboard/my-alerts" style={{ textDecoration: "none" }}>
                    <Button variant="primary" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button variant="secondary" size="sm" onClick={onLoginOpen}>
                      Log In
                    </Button>
                    <Button variant="primary" size="sm" onClick={onSignUpOpen}>
                      Sign Up
                    </Button>
                  </>
                )}
              </HStack>
            </HStack>
          )}

          {isDashboard && hasValidToken && currentUser && (
            <HStack gap={4} alignItems="center">
              <AccountSection username={currentUser.username} walletAddress={currentUser.wallet_address} />
            </HStack>
          )}
        </HStack>
      </Box>
      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
      <SignUpModal isOpen={isSignUpOpen} onClose={onSignUpClose} />
    </>
  );
}
