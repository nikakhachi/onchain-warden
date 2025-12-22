import { Text } from "@chakra-ui/react";
import { EthereumIcon } from "./EthereumIcon";
import { BaseChain } from "./BaseChain";
import { ArbitrumIcon } from "./ArbitrumIcon";
import { PolygonIcon } from "./PolygonIcon";
import { KatanaIcon } from "./KatanaIcon";
import { BinanceIcon } from "./BinanceIcon";
import { AvalancheIcon } from "./AvalancheIcon";

export const ChainIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "Ethereum":
      return <EthereumIcon />;
    case "Base":
      return <BaseChain />;
    case "Arbitrum":
      return <ArbitrumIcon />;
    case "Polygon":
      return <PolygonIcon />;
    case "Katana":
      return <KatanaIcon />;
    case "Binance":
      return <BinanceIcon />;
    case "Avalanche":
      return <AvalancheIcon />;
    default:
      return <Text>📱</Text>;
  }
};
