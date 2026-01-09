"use client";

import { useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { GRADIENTS } from "../../theme";
import { faqItems } from "../../shared/data/faq";

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="faq" ref={ref}>
      <style>{accordionStyles}</style>
      <Container maxW="4xl">
        <VStack gap={12}>
          <MotionVStack
            gap={4}
            textAlign="center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <Heading as="h2" size="4xl" fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} fontWeight="700" color="white">
              Frequently Asked{" "}
              <Box as="span" background={GRADIENTS.primary} backgroundClip="text" color="transparent">
                Questions
              </Box>
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Everything you need to know about Onchain Warden.
            </Text>
          </MotionVStack>

          <VStack gap={4} width="100%" alignItems="stretch">
            <Accordion width="100%" allowMultiple defaultIndex={[]} display="flex" flexDirection="column" gap={4}>
              {faqItems.map((item, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <AccordionItem
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
                  <AccordionButton
                    padding={6}
                    cursor="pointer"
                    _hover={{
                      backgroundColor: "transparent",
                    }}
                  >
                    <Box flex={1} textAlign="left" color="white" fontSize="md" fontWeight="500">
                      {item.question}
                    </Box>
                  </AccordionButton>
                  <AccordionPanel paddingX={6} paddingBottom={6}>
                    <Box paddingTop={4} borderTopWidth="1px" borderTopColor="gray.800">
                      <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                        {item.answer}
                      </Text>
                    </Box>
                  </AccordionPanel>
                  </AccordionItem>
                </MotionBox>
              ))}
            </Accordion>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
