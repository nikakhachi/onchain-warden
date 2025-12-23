import { GRADIENTS } from "@/app/theme";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
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
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="2xl"
      >
        {icon}
      </Box>

      <Heading as="h3" size="md" fontWeight="600" color="white">
        {title}
      </Heading>
      <Text color="gray.400" fontSize="sm">
        {description}
      </Text>
    </VStack>
  </Card>
);
