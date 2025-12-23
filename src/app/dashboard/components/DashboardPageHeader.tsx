import { Heading, VStack, HStack, Text } from "@chakra-ui/react";
import { Button } from "../../components/Button";

export const DashboardPageHeader = ({
  title,
  description,
  buttonLabel,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}) => (
  <VStack alignItems="flex-start" gap={2} marginBottom={8}>
    <HStack justifyContent="space-between" alignItems="center" width="100%">
      <Heading as="h1" size="lg" color="white">
        {title}
      </Heading>
      <Button variant="primary" size="sm" onClick={onClick}>
        {buttonLabel}
      </Button>
    </HStack>
    <Text color="gray.400" fontSize="sm">
      {description}
    </Text>
  </VStack>
);
