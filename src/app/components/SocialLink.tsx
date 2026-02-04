import { Box, Link } from "@chakra-ui/react";
import { DiscordIcon } from "../icons/DiscordIcon";
import { XIcon } from "../icons/XIcon";
import { SiGitbook } from "react-icons/si";

export const SocialLink = ({ label }: { label: "Discord" | "X" | "Docs" }) => (
  <Link
    href={
      label === "Discord"
        ? "https://discord.gg/wTCPkGmStr"
        : label === "X"
          ? "https://x.com/OnchainWardenHQ"
          : "https://onchainwarden.gitbook.io"
    }
    target="_blank"
    rel="noopener noreferrer"
    style={{ textDecoration: "none" }}
  >
    <Box
      width="32px"
      height="32px"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.700"
      display="flex"
      alignItems="center"
      justifyContent="center"
      _hover={{ borderColor: "gray.600" }}
      transition="border-color 0.2s"
      cursor="pointer"
    >
      {label === "Discord" ? (
        <DiscordIcon width="18px" height="18px" />
      ) : label === "X" ? (
        <XIcon width="18px" height="18px" />
      ) : (
        <SiGitbook width="18px" height="18px" color="white" />
      )}
    </Box>
  </Link>
);
