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
import { faqItems } from "../data/faq";

const accordionStyles = `
  [data-accordion-item][data-state="open"] {
    border-color: rgb(59, 130, 246) !important;
  }
  [data-accordion-item] {
    transform: translateZ(0);
    backface-visibility: hidden;
  }
`;

export function FAQ() {
  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="faq">
      <style>{accordionStyles}</style>
      <Container maxW="4xl">
        <VStack gap={12}>
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
                  backgroundColor="rgba(33, 33, 33, 0.2)"
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
