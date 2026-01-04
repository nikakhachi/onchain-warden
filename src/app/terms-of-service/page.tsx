"use client";

import { Box, Container, VStack, Heading, Text } from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function TermsOfService() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" backgroundColor="gray.950">
      <Navbar />
      <Box flex={1} paddingY={12}>
        <Container maxW="4xl">
          <VStack gap={8} alignItems="flex-start" color="white">
            <VStack gap={4} alignItems="flex-start" width="100%">
              <Heading as="h1" size="2xl" color="white" fontWeight="700">
                Terms of Service
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Last Updated: January 5, 2026
              </Text>
            </VStack>

            <VStack gap={6} alignItems="flex-start" width="100%">
              <Text color="gray.300" fontSize="md" lineHeight="1.8">
                Welcome to Onchain Warden. By accessing or using our service, you agree to be bound by these Terms of
                Service.
              </Text>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Acceptance of Terms
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  By using Onchain Warden, you agree to:
                </Text>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>Comply with these Terms of Service</li>
                  <li>Use the service responsibly and lawfully</li>
                  <li>Provide accurate information when creating an account</li>
                </Box>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Service Description
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  Onchain Warden provides real-time blockchain monitoring and alert services. We allow you to:
                </Text>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>Monitor smart contract events across multiple blockchains</li>
                  <li>Set custom alert conditions</li>
                  <li>Receive notifications through various channels</li>
                </Box>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  User Responsibilities
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  You agree to:
                </Text>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>Use the service for lawful purposes only</li>
                  <li>Not abuse, spam, or overload our monitoring systems</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Keep your account credentials secure</li>
                </Box>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Service Availability
                </Heading>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>We strive to provide reliable service but cannot guarantee 100% uptime</li>
                  <li>We may modify, suspend, or discontinue features with or without notice</li>
                  <li>We are not liable for any losses due to service interruptions</li>
                </Box>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Disclaimer of Warranties
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  Onchain Warden is provided "as is" and "as available" without warranties of any kind, either express
                  or implied. We do not guarantee:
                </Text>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>Uninterrupted or error-free service</li>
                  <li>Accuracy of blockchain data from third-party providers</li>
                  <li>That the service will meet your specific requirements</li>
                </Box>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Limitation of Liability
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  To the fullest extent permitted by law, Onchain Warden shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages resulting from your use of the service.
                </Text>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Account Termination
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  We reserve the right to:
                </Text>
                <Box as="ul" paddingLeft={6} color="gray.300" fontSize="md" lineHeight="1.8">
                  <li>Suspend or terminate accounts that violate these terms</li>
                  <li>Modify or discontinue the service at any time</li>
                  <li>Remove content that violates our policies</li>
                </Box>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  You may terminate your account at any time by deleting it from your dashboard.
                </Text>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Intellectual Property
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  All content, features, and functionality of Onchain Warden are owned by us and protected by
                  intellectual property laws.
                </Text>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Changes to Terms
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  We may update these Terms of Service from time to time. Continued use of the service after changes
                  constitutes acceptance of the new terms.
                </Text>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%">
                <Heading as="h2" size="lg" color="white" fontWeight="600">
                  Contact
                </Heading>
                <Text color="gray.300" fontSize="md" lineHeight="1.8">
                  For questions about these Terms of Service, contact us at:
                </Text>
                <Text color="blue.400" fontSize="md" fontWeight="500">
                  support@onchainwarden.com
                </Text>
              </VStack>

              <Box paddingTop={4} borderTopWidth="1px" borderTopColor="gray.800" width="100%">
                <Text color="gray.400" fontSize="md" lineHeight="1.8">
                  By using Onchain Warden, you acknowledge that you have read, understood, and agree to be bound by
                  these Terms of Service.
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
