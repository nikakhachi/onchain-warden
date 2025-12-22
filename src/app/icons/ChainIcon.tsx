import { Text } from "@chakra-ui/react";
import { EthereumIcon } from "./EthereumIcon";
import { BaseChain } from "./BaseChain";
import { ArbitrumIcon } from "./ArbitrumIcon";

export const ChainIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "Ethereum":
      return <EthereumIcon />;
    case "Base":
      return <BaseChain />;
    case "Arbitrum":
      return <ArbitrumIcon />;
    default:
      return <Text>📱</Text>;
  }
};
