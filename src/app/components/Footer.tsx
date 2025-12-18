"use client";

import { Box, Container, HStack, Text, VStack, Link } from "@chakra-ui/react";

export function Footer() {
  return (
    <Box
      as="footer"
      backgroundColor="gray.900"
      borderTopWidth="1px"
      borderTopColor="gray.800"
      paddingY={8}
      marginTop="auto"
    >
      <Container maxW="7xl">
        <VStack gap={4} alignItems="center">
          <HStack gap={6}>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              color="gray.400"
              _hover={{ color: "blue.400" }}
              transition="color 0.2s"
            >
              GitHub
            </Link>
            <Link
              href="https://docs.example.com"
              target="_blank"
              rel="noopener noreferrer"
              color="gray.400"
              _hover={{ color: "blue.400" }}
              transition="color 0.2s"
            >
              Documentation
            </Link>
            <Link
              href="/privacy"
              color="gray.400"
              _hover={{ color: "blue.400" }}
              transition="color 0.2s"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              color="gray.400"
              _hover={{ color: "blue.400" }}
              transition="color 0.2s"
            >
              Terms
            </Link>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            © {new Date().getFullYear()} EventFlow. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
