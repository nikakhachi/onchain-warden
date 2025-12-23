import { Heading, VStack, HStack, Text } from "@chakra-ui/react";
import { Button } from "../../components/Button";

type DashboardPageHeaderProps = {
  title: string;
  description: string;
  buttonLabel?: string;
  onClick?: () => void;
  marginBottom?: number | string;
};

export const DashboardPageHeader = ({
  title,
  description,
  buttonLabel,
  onClick,
  marginBottom = 8,
}: DashboardPageHeaderProps) => (
  <VStack alignItems="flex-start" gap={2} marginBottom={marginBottom}>
    <HStack justifyContent="space-between" alignItems="center" width="100%">
      <Heading as="h1" size="lg" color="white">
        {title}
      </Heading>
      {buttonLabel && onClick && (
        <Button variant="primary" size="sm" onClick={onClick}>
          {buttonLabel}
        </Button>
      )}
    </HStack>
    <Text color="gray.400" fontSize="sm">
      {description}
    </Text>
  </VStack>
);
