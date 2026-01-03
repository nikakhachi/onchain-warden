import { GmailIcon } from "@/app/icons/GmailIcon";
import { Box, VStack, Text } from "@chakra-ui/react";

export const Gmail = ({ handleClick, isAuthenticating }: { handleClick: () => void; isAuthenticating: boolean }) => {
  return (
    <Box
      as="button"
      onClick={handleClick}
      disabled={isAuthenticating}
      display="flex"
      alignItems="center"
      gap={4}
      padding={4}
      borderRadius="xl"
      borderWidth="2px"
      borderColor="gray.700"
      backgroundColor="gray.800"
      color="white"
      transition="all 0.2s"
      _hover={!isAuthenticating ? { borderColor: "gray.600", backgroundColor: "gray.700" } : {}}
      width="100%"
      cursor={isAuthenticating ? "not-allowed" : "pointer"}
    >
      <Box
        width="48px"
        height="48px"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <GmailIcon />
      </Box>
      <VStack alignItems="flex-start" gap={0} flex={1}>
        <Text fontWeight="600" fontSize="md">
          Gmail
        </Text>
        <Text fontSize="sm" color="gray.300">
          Continue with your Google account
        </Text>
      </VStack>
    </Box>
  );
};
