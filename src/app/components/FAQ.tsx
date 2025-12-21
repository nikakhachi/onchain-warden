"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  AccordionRoot,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
} from "@chakra-ui/react";
import { GRADIENTS } from "../theme";

// Add global styles for accordion expanded state
// Border color change is instant to avoid animation conflicts
const accordionStyles = `
  [data-accordion-item][data-state="open"] {
    border-color: rgb(59, 130, 246) !important;
  }
  [data-accordion-item] {
    transform: translateZ(0);
    backface-visibility: hidden;
  }
`;

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What is WatcherX?",
    answer:
      "WatcherX is a real-time blockchain monitoring platform that allows you to track on-chain events across multiple chains. Set up custom watchers for any contract event and receive instant notifications via Telegram, Discord, Slack, or webhooks.",
  },
  {
    question: "Which blockchains are supported?",
    answer:
      "We support all major EVM-compatible chains including Ethereum, Polygon, Arbitrum, Optimism, Base, Avalanche, BNB Chain, and many more. New chains are added regularly.",
  },
  {
    question: "How do I set up a watcher?",
    answer:
      "Setting up a watcher is simple: connect your wallet, choose a chain and contract address, select the event you want to monitor, add any filter conditions, configure your notification message, and choose your integration destinations. The entire process takes just a few minutes.",
  },
  {
    question: "Can I set conditions for when to be notified?",
    answer:
      "Yes! You can add filter conditions to your watchers. For example, you can set conditions like 'only notify me when the amount is greater than 1000' or 'only notify when the sender address matches a specific value'. This helps you receive only the notifications that matter to you.",
  },
  {
    question: "What notification channels are available?",
    answer:
      "We support multiple notification channels including Telegram, Discord, Slack, and custom webhooks. You can configure multiple integrations for a single watcher to receive notifications across all your preferred channels.",
  },
  {
    question: "Is there a limit to how many watchers I can create?",
    answer:
      "No, there's no limit to the number of watchers you can create. Monitor as many contracts and events as you need. Our platform is designed to scale with your monitoring requirements.",
  },
];

export function FAQ() {
  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950">
      <style>{accordionStyles}</style>
      <Container maxW="4xl">
        <VStack gap={12}>
          {/* Header */}
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="5xl" fontWeight="700" color="white">
              Frequently Asked{" "}
              <Box
                as="span"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                Questions
              </Box>
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Everything you need to know about WatcherX
            </Text>
          </VStack>

          {/* FAQ Items */}
          <VStack gap={4} width="100%" alignItems="stretch">
            <AccordionRoot
              width="100%"
              collapsible
              defaultValue={[]}
              display="flex"
              flexDirection="column"
              gap={4}
            >
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  borderWidth="1px"
                  borderColor="gray.800"
                  borderRadius="xl"
                  backgroundColor="gray.900"
                  overflow="hidden"
                  data-accordion-item
                  _hover={{
                    borderColor: "gray.700",
                  }}
                >
                  <AccordionItemTrigger
                    padding={6}
                    cursor="pointer"
                    _hover={{
                      backgroundColor: "transparent",
                    }}
                  >
                    <Box
                      flex={1}
                      textAlign="left"
                      color="white"
                      fontSize="md"
                      fontWeight="500"
                    >
                      {item.question}
                    </Box>
                  </AccordionItemTrigger>
                  <AccordionItemContent paddingX={6} paddingBottom={6}>
                    <Box
                      paddingTop={4}
                      borderTopWidth="1px"
                      borderTopColor="gray.800"
                    >
                      <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                        {item.answer}
                      </Text>
                    </Box>
                  </AccordionItemContent>
                </AccordionItem>
              ))}
            </AccordionRoot>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
