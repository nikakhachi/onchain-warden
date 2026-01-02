"use client";

import { useState } from "react";
import { Box, Container, VStack, Text, Spinner } from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { Button } from "../../components/Button";
import { AddAddressDialog } from "./Dialog";
import { AddressMenu } from "./AddressMenu";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { useWallet } from "@/app/providers/WalletContext";
import { LoadingScreen } from "../components/LoadingScreen";

export default function AddressesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { hasValidToken } = useWallet();
  const { teamAddresses, getAddedByUsername } = useUser();

  if (!hasValidToken) return <LoadingScreen />;

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <DashboardPageHeader
          title="Addresses"
          description="Label frequently used addresses"
          buttonLabel="+ Add Address"
          onClick={() => setIsAddOpen(true)}
        />

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
          <Box borderRadius="2xl" backgroundColor="gray.900" borderWidth="1px" borderColor="gray.800" overflow="hidden">
            <Box
              display="grid"
              gridTemplateColumns="0.9fr 1.7fr 0.8fr 0.5fr"
              paddingX={6}
              paddingY={4}
              borderBottomWidth="1px"
              borderBottomColor="gray.800"
              backgroundColor="gray.900"
              alignItems="center"
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
        )}

        <AddAddressDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      </Container>
    </Box>
  );
}
