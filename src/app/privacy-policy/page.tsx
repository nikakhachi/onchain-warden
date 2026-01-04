"use client";

import { Box, Container, VStack, Heading, Text } from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" backgroundColor="gray.950">
      <Navbar />
      <Box flex={1} paddingY={12}>
        <Container maxW="4xl">
          <VStack gap={8} alignItems="flex-start" color="white">
            <VStack gap={4} alignItems="flex-start" width="100%">
              <Heading as="h1" size="2xl" color="white" fontWeight="700">
                Privacy Policy
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Last Updated: January 5, 2026
              </Text>
            </VStack>

            <VStack gap={6} alignItems="flex-start" width="100%">
              <Text color="gray.300" fontSize="md" lineHeight="1.8">
                At Onchain Warden, we respect your privacy and are committed to protecting your personal data.
              </Text>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Information We Collect
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  When you use Onchain Warden, we collect:
                </Text>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>
                    <strong>Account Information:</strong> Email address (if you sign in with Gmail) or wallet address
                    (if you sign in with wallet)
                  </li>
                  <li>
                    <strong>Alert Data:</strong> Alert configurations, conditions, and notification preferences you
                    create
                  </li>
                  <li>
                    <strong>Usage Data:</strong> How you interact with our service to improve functionality
                  </li>
                </Box>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  How We Use Your Information
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  We use your information to:
                </Text>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>Provide real-time monitoring and alert services</li>
                  <li>Send notifications via your chosen channels</li>
                  <li>Maintain and improve our service</li>
                  <li>Communicate important updates about the service</li>
                </Box>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Data Storage and Security
                </Heading>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>Your data is stored securely on protected servers</li>
                  <li>We implement industry-standard security measures</li>
                  <li>We do not sell, rent, or share your data with third parties for marketing purposes</li>
                </Box>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Third-Party Services
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  We integrate with the following services:
                </Text>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>
                    <strong>Communication:</strong> Telegram, Discord, Slack (for delivering notifications)
                  </li>
                  <li>
                    <strong>Authentication:</strong> Google OAuth and EVM wallet providers
                  </li>
                  <li>
                    <strong>Blockchain Data:</strong> Various RPC providers (to monitor on-chain events)
                  </li>
                </Box>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  Each of these services has their own privacy policies.
                </Text>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Your Rights
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  You have the right to:
                </Text>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>Access your personal data</li>
                  <li>Delete your associated data at any time</li>
                  <li>Export your data</li>
                  <li>Update or correct your information</li>
                  <li>Contact us with privacy concerns or questions</li>
                </Box>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Data Retention
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  We retain your data for as long as your account is active. When you delete your account, we remove
                  your personal data from our systems.
                </Text>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Changes to This Policy
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  We may update this privacy policy from time to time. We will notify you of any changes by updating the
                  "Last Updated" date.
                </Text>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Contact Us
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  For privacy questions or concerns, please contact us at:
                </Text>
                <Text color="blue.400" fontSize="md" fontWeight="500">
                  support@onchainwarden.com
                </Text>
              </VStack>

              <Box paddingTop={4} borderTopWidth="1px" borderTopColor="gray.800" width="100%">
                <Text color="gray.400" fontSize="md" lineHeight="1.8">
                  Onchain Warden is committed to protecting your privacy and ensuring transparency in how we handle your
                  data.
                </Text>
              </Box>
            </VStack>
          </VStack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
