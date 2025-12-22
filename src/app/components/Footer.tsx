"use client";

import { Box, Container, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";

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
            © 2025 Onchain Warden. All rights reserved.
          </Text>

          <HStack gap={3} alignItems="center">
            <Link
              href="https://discord.gg"
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
                <Text fontSize="md" color="white">
                  💬
                </Text>
              </Box>
            </Link>
            <Link
              href="https://twitter.com"
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
                <Text fontSize="md" color="white">
                  🐦
                </Text>
              </Box>
            </Link>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
