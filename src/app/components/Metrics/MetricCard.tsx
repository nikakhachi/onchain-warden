import { GRADIENTS } from "@/app/theme";
import { Box, Text, VStack } from "@chakra-ui/react";
import { Card } from "../Card";

export const MetricCard = ({
  icon,
  value,
  title,
  description,
}: {
  icon: string;
  value: number;
  title: string;
  description: string;
}) => (
  <Card>
    <VStack gap={4}>
      <Box
        width="48px"
        height="48px"
        borderRadius="xl"
        background={GRADIENTS.primaryDiagonalReverse}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="2xl"
      >
        {icon}
      </Box>
      <Text
        fontSize="5xl"
        fontWeight="bold"
        background={GRADIENTS.primary}
        backgroundClip="text"
        color="transparent"
      >
        {value}
      </Text>
      <Text color="white" fontSize="lg" fontWeight="medium">
        {title}
      </Text>
      <Text color="gray.400" fontSize="sm">
        {description}
      </Text>
    </VStack>
  </Card>
);
