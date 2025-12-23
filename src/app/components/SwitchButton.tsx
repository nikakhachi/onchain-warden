import { GRADIENTS } from "@/app/theme";
import { Box } from "@chakra-ui/react";

export const SwitchButton = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <Box
    as="button"
    paddingX={4}
    paddingY={2}
    borderRadius="md"
    backgroundImage={active ? GRADIENTS.button : "none"}
    backgroundColor={active ? "transparent" : "transparent"}
    color={active ? "white" : "gray.400"}
    onClick={onClick}
    fontWeight={active ? "600" : "500"}
    fontSize="sm"
    transition="all 0.2s"
    _hover={{
      backgroundImage: active ? GRADIENTS.button : "none",
      backgroundColor: active ? "transparent" : "gray.700",
      color: active ? "white" : "gray.300",
      opacity: active ? 0.9 : 1,
    }}
  >
    {label}
  </Box>
);
