"use client";

import { Box, Container, HStack, Text, Link } from "@chakra-ui/react";
import { SocialLink } from "../SocialLink";

export function Footer() {
  return (
    <Box as="footer" backgroundColor="gray.950" paddingY={8} marginTop="auto">
      <Container maxW="7xl">
        <HStack
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={{ base: "column", md: "row" }}
          gap={4}
        >
          <Text color="gray.400" fontSize="sm">
            © 2026 Onchain Warden. All rights reserved.
          </Text>

          <HStack gap={4} alignItems="center" flexDirection={{ base: "column", md: "row" }}>
            <HStack gap={4} alignItems="center">
              <Link href="/privacy-policy" color="gray.400" fontSize="sm" _hover={{ color: "gray.300" }}>
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" color="gray.400" fontSize="sm" _hover={{ color: "gray.300" }}>
                Terms of Service
              </Link>
            </HStack>

            <HStack gap={3} alignItems="center">
              <SocialLink label="X" />
              <SocialLink label="Discord" />
            </HStack>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
