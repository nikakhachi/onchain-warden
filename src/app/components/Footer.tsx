"use client";

import { Box, Container, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { GRADIENTS } from "../theme";

export function Footer() {
  return (
    <Box as="footer" backgroundColor="gray.950" paddingY={12} marginTop="auto">
      <Container maxW="7xl">
        <VStack gap={8}>
          {/* Top Section */}
          <HStack
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={{ base: "column", md: "row" }}
            gap={8}
          >
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <HStack gap={3} alignItems="center">
                <Box
                  width="40px"
                  height="40px"
                  borderRadius="full"
                  background={GRADIENTS.primaryDiagonal}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xl"
                  color="white"
                >
                  ⚡
                </Box>
                <Text color="white" fontSize="lg" fontWeight="600">
                  onchain warden
                </Text>
              </HStack>
            </Link>

            {/* Center Navigation Links */}
            <HStack gap={6} alignItems="center">
              <Link href="#docs" style={{ textDecoration: "none" }}>
                <Text
                  color="gray.400"
                  fontSize="sm"
                  _hover={{ color: "white" }}
                  transition="color 0.2s"
                  cursor="pointer"
                >
                  Documentation
                </Text>
              </Link>
              <Link href="#api" style={{ textDecoration: "none" }}>
                <Text
                  color="gray.400"
                  fontSize="sm"
                  _hover={{ color: "white" }}
                  transition="color 0.2s"
                  cursor="pointer"
                >
                  API
                </Text>
              </Link>
              <Link href="#pricing" style={{ textDecoration: "none" }}>
                <Text
                  color="gray.400"
                  fontSize="sm"
                  _hover={{ color: "white" }}
                  transition="color 0.2s"
                  cursor="pointer"
                >
                  Pricing
                </Text>
              </Link>
              <Link href="#support" style={{ textDecoration: "none" }}>
                <Text
                  color="gray.400"
                  fontSize="sm"
                  _hover={{ color: "white" }}
                  transition="color 0.2s"
                  cursor="pointer"
                >
                  Support
                </Text>
              </Link>
            </HStack>

            {/* Social Media Icons */}
            <HStack gap={3} alignItems="center">
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Box
                  width="40px"
                  height="40px"
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
                  <Text fontSize="lg" color="white">
                    🐦
                  </Text>
                </Box>
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Box
                  width="40px"
                  height="40px"
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
                  <Text fontSize="lg" color="white">
                    🐙
                  </Text>
                </Box>
              </Link>
            </HStack>
          </HStack>

          {/* Separator */}
          <Box width="100%" height="1px" backgroundColor="gray.800" />

          {/* Copyright */}
          <Text color="gray.400" fontSize="sm" textAlign="center">
            © 2025 onchain warden. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
