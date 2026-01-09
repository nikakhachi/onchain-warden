import { EulerIcon } from "./EulerIcon";
import { MorphoIcon } from "./MorphoIcon";
import { PendleIcon } from "./PendleIcon";
import { Text } from "@chakra-ui/react";
import { ReservoirIcon } from "./ReservoirIcon";
import { AaveIcon } from "./AaveIcon";
import { UniswapIcon } from "./UniswapIcon";
import { DeFiIcon } from "./DeFiIcon";
import { LayerZeroIcon } from "./LayerzeroIcon";
import { YoIcon } from "./YoIcon";

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
    case "General DeFi":
      return <DeFiIcon />;
    case "LayerZero":
      return <LayerZeroIcon />;
    case "YO":
      return <YoIcon />;
    default:
      return <Text>📱</Text>;
  }
};
