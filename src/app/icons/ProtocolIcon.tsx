import { EulerIcon } from "./EulerIcon";
import { MorphoIcon } from "./MorphoIcon";
import { PendleIcon } from "./PendleIcon";
import { Text } from "@chakra-ui/react";
import { ReservoirIcon } from "./ReservoirIcon";
import { AaveIcon } from "./AaveIcon";
import { UniswapIcon } from "./UniswapIcon";

export const ProtocolIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "Morpho":
      return <MorphoIcon />;
    case "Pendle":
      return <PendleIcon />;
    case "Euler":
      return <EulerIcon />;
    case "Reservoir":
      return <ReservoirIcon />;
    case "Aave":
      return <AaveIcon />;
    case "Uniswap":
      return <UniswapIcon />;
    default:
      return <Text>📱</Text>;
  }
};
