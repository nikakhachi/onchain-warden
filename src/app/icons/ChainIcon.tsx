import { Text } from "@chakra-ui/react";
import { EthereumIcon } from "./EthereumIcon";
import { BaseChain } from "./BaseChain";
import { ArbitrumIcon } from "./ArbitrumIcon";
import { PolygonIcon } from "./PolygonIcon";
import { KatanaIcon } from "./KatanaIcon";
import { BinanceIcon } from "./BinanceIcon";
import { AvalancheIcon } from "./AvalancheIcon";
import { BinanceSmartChain } from "./BinanceSmartChain";
import { MonadIcon } from "./MonadIcon";

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
    case "BNB Smart Chain":
      return <BinanceSmartChain />;
    case "Arbitrum One":
      return <ArbitrumIcon />;
    case "Monad":
      return <MonadIcon />;
    default:
      return <Text>📱</Text>;
  }
};
