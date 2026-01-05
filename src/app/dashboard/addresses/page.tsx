"use client";

import { useState } from "react";
import { Box, Container, VStack, Text, Spinner } from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { Button } from "../../components/Button";
import { AddAddressDialog } from "./Dialog";
import { AddressMenu } from "./AddressMenu";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { useAuth } from "@/app/providers/AuthContext";
import { LoadingScreen } from "../components/LoadingScreen";

export default function AddressesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { currentUser } = useAuth();
  const { teamAddresses, getAddedByUsername } = useUser();

  if (!currentUser) return <LoadingScreen />;

  return (
    <Box flex={1} display="flex" flexDirection="column" height="calc(100vh - 80px)" overflow="hidden" paddingY={8}>
      <Container maxW="8xl" flex={1} display="flex" flexDirection="column" minHeight={0}>
        <Box flexShrink={0}>
          <DashboardPageHeader
            title="Addresses"
            description="Label frequently used addresses"
            buttonLabel="+ Add Address"
            onClick={() => setIsAddOpen(true)}
          />
        </Box>

        <Box flex={1} minHeight={0} overflowY="auto">
          {teamAddresses === undefined ? (
            <Box
              padding={12}
              textAlign="center"
              borderRadius="2xl"
              backgroundColor="gray.900"
              borderWidth="1px"
              borderColor="gray.800"
            >
              <Spinner size="lg" color="blue.500" />
            </Box>
          ) : !teamAddresses?.length ? (
            <Box
              padding={8}
              textAlign="center"
              borderRadius="2xl"
              backgroundColor="gray.900"
              borderWidth="1px"
              borderColor="gray.800"
            >
              <Text color="gray.400" marginBottom={4}>
                You don't have any saved addresses yet.
              </Text>
              <Button variant="primary" size="md" onClick={() => setIsAddOpen(true)}>
                Add Your First Address
              </Button>
            </Box>
          ) : (
            <Box
              borderRadius="2xl"
              backgroundColor="gray.900"
              borderWidth="1px"
              borderColor="gray.800"
              overflow="hidden"
              display="flex"
              flexDirection="column"
              height="100%"
            >
              <Box
                display="grid"
                gridTemplateColumns="0.9fr 1.7fr 0.8fr 0.5fr"
                paddingX={6}
                paddingY={4}
                borderBottomWidth="1px"
                borderBottomColor="gray.800"
                backgroundColor="gray.900"
                alignItems="center"
                flexShrink={0}
              >
                <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                  Label
                </Text>
                <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                  Address
                </Text>
                <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                  Added by
                </Text>
                <Box display="flex" justifyContent="flex-end">
                  <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                    Actions
                  </Text>
                </Box>
              </Box>

              <Box flex={1} overflowY="auto" minHeight={0}>
                <VStack gap={0} alignItems="stretch">
                  {teamAddresses?.map((teamAddress) => {
                    return (
                      <Box
                        key={teamAddress._id}
                        display="grid"
                        gridTemplateColumns="0.9fr 1.7fr 0.8fr 0.5fr"
                        paddingX={6}
                        paddingY={4}
                        borderBottomWidth="1px"
                        borderBottomColor="gray.800"
                        _hover={{ backgroundColor: "gray.850" }}
                        _last={{ borderBottomWidth: "0" }}
                        alignItems="center"
                      >
                        <Box minWidth={0} overflow="hidden">
                          <Text color="white" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                            {teamAddress.label}
                          </Text>
                        </Box>
                        <Box minWidth={0} overflow="hidden">
                          <Text
                            color="white"
                            fontSize="sm"
                            fontFamily="mono"
                            onClick={() => {
                              navigator.clipboard.writeText(teamAddress.address);
                            }}
                            cursor="pointer"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {teamAddress.address}
                          </Text>
                        </Box>
                        <Box minWidth={0} overflow="hidden">
                          <Text
                            color="gray.400"
                            fontSize="sm"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {getAddedByUsername(teamAddress.added_by)}
                          </Text>
                        </Box>
                        <Box minWidth={0} display="flex" justifyContent="flex-end">
                          <AddressMenu
                            addressId={teamAddress._id}
                            label={teamAddress.label}
                            address={teamAddress.address}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            </Box>
          )}
        </Box>

        <AddAddressDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      </Container>
    </Box>
  );
}
