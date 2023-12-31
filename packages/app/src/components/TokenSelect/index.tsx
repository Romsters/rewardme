import { useEffect, useRef, useState } from "react";
import { useNetwork, useAccount, erc721ABI, readContracts } from "wagmi";
import { fetchBalance } from "@wagmi/core";
import { Box, InputLabel, MenuItem, FormControl } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { ZKSYNC_ETH_ADDRESS, L1_ETH_ADDRESS } from "../../utils";
import TokenItem, { type Token } from "../TokenItem";

export interface TokenSelectProps {
  value: Token | null;
  setValue: (value: Token | null) => void;
}

export default function TokenSelect({ value, setValue }: TokenSelectProps) {
  const currentChainId = useRef<string>("");
  const { chain } = useNetwork();
  const { address } = useAccount();
  const [isLoading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const isL2 = !!(chain as any)?.isL2;

  const fetchUserTokens = async () => {
    setLoading(isLoading);
    try {
      let tokens = [];
      if (!isL2) {
        // Replace with proper explorer calls to get all tokens
        const ethBalance = await fetchBalance({ address: address! });
        tokens = [
          {
            address: L1_ETH_ADDRESS,
            balance: ethBalance.value.toString(),
            isNFT: false,
            token: {
              decimals: ethBalance.decimals,
              symbol: ethBalance.symbol,
            },
          },
        ];
      } else {
        const blockExplorerApiUrl = (chain as any).blockExplorers.default.apiUrl;
        const response = await fetch(`${blockExplorerApiUrl}/address/${address}`);
        const addressData = await response.json();
        tokens = Object.keys(addressData.balances)
          .filter((tokenAddress) => Number(addressData.balances[tokenAddress].balance) > 0)
          .map((tokenAddress) => ({
            address: tokenAddress,
            isNFT: false,
            ...addressData.balances[tokenAddress],
          }));
      }

      const ethToken = tokens.find((token) =>
        [L1_ETH_ADDRESS, ZKSYNC_ETH_ADDRESS].includes(token.address.toLowerCase())
      );
      if (ethToken) {
        ethToken.token = {
          symbol: "ETH",
          decimals: 18,
        };
      }

      const nfts = tokens.filter((token) => !token.token);
      const nftsSymbols = await readContracts({
        contracts: nfts.map((nft) => ({
          address: nft.address,
          abi: erc721ABI,
          functionName: "symbol",
        })),
      });
      nfts.forEach((nft, index) => {
        if (nftsSymbols[index]?.status !== "success" || !nftsSymbols[index]?.result) {
          return;
        }
        nft.isNFT = true;
        nft.token = {
          symbol: nftsSymbols[index].result,
          decimals: 0,
        };
      });
      const filteredTokens = tokens.filter((token) => token.token);
      setTokens(filteredTokens);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chain?.id) {
      return;
    }
    if (currentChainId.current === chain.id.toString()) {
      return;
    }
    currentChainId.current = chain.id.toString();
    fetchUserTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain?.id]);

  const handleChange = (event: SelectChangeEvent) => {
    setValue(tokens.find((token) => token.address === event.target.value) || null);
  };

  return (
    <Box>
      <FormControl sx={{ minWidth: "320px" }}>
        <InputLabel id="demo-simple-select-label">Select token</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value?.address || ""}
          label="Token"
          onChange={handleChange}
        >
          {tokens.map((token) => (
            <MenuItem key={token.address} value={token.address}>
              <TokenItem {...token} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
