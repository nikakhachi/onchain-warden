"use client";

import { useState, useRef } from "react";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { GRADIENTS } from "../../theme";
import { UseCasesContent } from "./UseCasesContent";
import { TemplatesContent } from "./TemplatesContent";
import { SwitchButton } from "../SwitchButton";

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

export function UseCases() {
  const [showTemplates, setShowTemplates] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="templates" ref={ref}>
      <Container maxW="7xl">
        <VStack gap={12}>
          <MotionVStack
            gap={4}
            textAlign="center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <Heading as="h2" size="4xl" fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} fontWeight="700" color="white">
              Built for{" "}
              <Box as="span" background={GRADIENTS.primary} backgroundClip="text" color="transparent">
                Everyone
              </Box>
            </Heading>
            <Text color="gray.400" fontSize="lg" maxW="2xl">
              Custom alerts for any use case. Pre-built templates to get started fast.
            </Text>

            <MotionBox
              display="flex"
              gap={2}
              padding={1.5}
              borderRadius="lg"
              backgroundColor="rgba(33, 33, 33, 0.2)"
              borderWidth="1px"
              borderColor="gray.800"
              width="fit-content"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SwitchButton active={!showTemplates} onClick={() => setShowTemplates(false)} label="Use Cases" />
              <SwitchButton
                active={showTemplates}
                onClick={() => setShowTemplates(true)}
                label={`Templates (150+)`}
              />
            </MotionBox>
          </MotionVStack>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            width="100%"
          >
            {!showTemplates ? <UseCasesContent /> : <TemplatesContent />}
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}
