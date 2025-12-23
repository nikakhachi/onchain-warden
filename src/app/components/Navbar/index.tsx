"use client";

import { usePathname } from "next/navigation";
import { useWallet } from "../../providers/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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

const NavItem = ({
  sectionId,
  label,
}: {
  sectionId: string;
  label: string;
}) => (
  <Box
    as="button"
    onClick={(e: React.MouseEvent<HTMLElement>) =>
      handleSmoothScroll(e, sectionId)
    }
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
  const { isConnected } = useWallet();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
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
      <HStack
        paddingY={4}
        paddingX={6}
        justifyContent="space-between"
        alignItems="center"
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <HStack gap={2} alignItems="center">
            <OnchainWatcherIcon width="40px" height="40px" />
            <Heading as="h1" fontSize="xl" color="white" fontWeight="600">
              Onchain Warden
            </Heading>
          </HStack>
        </Link>

        <HStack gap={8}>
          {isLandingPage && (
            <HStack
              gap={8}
              alignItems="center"
              flex={1}
              justifyContent="center"
            >
              <NavItem sectionId="#how-it-works" label="How it Works" />
              <NavItem sectionId="#templates" label="Use Cases" />
              <NavItem sectionId="#metrics" label="Metrics" />
              <NavItem sectionId="#faq" label="FAQ" />
            </HStack>
          )}

          <HStack gap={4} alignItems="center">
            {isLandingPage && isConnected && (
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="sm">
                  Dashboard
                </Button>
              </Link>
            )}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== "loading";
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === "authenticated");

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={openConnectModal}
                          >
                            Connect Wallet
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={openChainModal}
                          >
                            Wrong network
                          </Button>
                        );
                      }

                      return (
                        <HStack gap={2}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={openAccountModal}
                          >
                            {account.displayName}
                          </Button>
                        </HStack>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </HStack>
        </HStack>
      </HStack>
    </Box>
  );
}
