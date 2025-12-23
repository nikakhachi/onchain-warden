"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Box, HStack } from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { useToast } from "../../providers/ToastContext";
import { UpdateAddressDialog } from "./UpdateDialog";

interface AddressMenuProps {
  addressId: Id<"owner_addresses">;
  label: string;
  address: string;
}

export function AddressMenu({ addressId, label, address }: AddressMenuProps) {
  const { address: walletAddress, getAccessToken } = useWallet();
  const { error: showError, success: showSuccess } = useToast();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteOwnerAddress = useMutation(api.ownerAddresses.deleteOwnerAddress);

  const handleEdit = () => {
    setIsUpdateOpen(true);
  };

  const handleDelete = async () => {
    if (!walletAddress) {
      showError("Wallet not connected");
      return;
    }

    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        showError("Failed to authenticate. Please try again.");
        setIsDeleting(false);
        return;
      }

      await deleteOwnerAddress({
        id: addressId,
        accessToken,
      });
      showSuccess("Address deleted successfully");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to delete address"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <HStack gap={2}>
        <Box
          as="button"
          cursor="pointer"
          padding={1.5}
          borderRadius="md"
          _hover={{ backgroundColor: "gray.800" }}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleEdit();
          }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="16px"
        >
          ✏️
        </Box>

        <Box
          as="button"
          cursor={isDeleting ? "not-allowed" : "pointer"}
          padding={1.5}
          borderRadius="md"
          _hover={isDeleting ? {} : { backgroundColor: "gray.800" }}
          opacity={isDeleting ? 0.5 : 1}
          onClick={(e: React.MouseEvent) => {
            if (isDeleting) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            e.stopPropagation();
            handleDelete();
          }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="16px"
        >
          ❌
        </Box>
      </HStack>

      <UpdateAddressDialog
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
        }}
        addressId={addressId}
        initialLabel={label}
        initialAddress={address}
      />
    </>
  );
}
