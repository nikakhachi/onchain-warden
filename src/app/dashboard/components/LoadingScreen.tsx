import { HStack, Spinner } from "@chakra-ui/react";

export const LoadingScreen = () => {
  return (
    <HStack width="100%" height="100%" justifyContent="center" alignItems="center">
      <Spinner color="white" />
    </HStack>
  );
};
