import { useEffect, useRef, useState } from "react";
import { useNetwork, useAccount, erc721ABI, readContracts } from "wagmi";
import { Box, InputLabel, MenuItem, FormControl } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { ZKSYNC_ETH_ADDRESS } from "../../utils";
import TokenItem, { type Token } from "../TokenItem";

export interface TokenSelectProps {
  value: Token | null;
  setValue: (value: Token | null) => void;
}

export default function TokenSelect({ value, setValue }: TokenSelectProps) {
  const initialized = useRef(false);
  const { chain } = useNetwork();
  const { address } = useAccount();
  const [isLoading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);

  const fetchUserTokens = async () => {
    setLoading(isLoading);
    try {
      const blockExplorerApiUrl = (chain as any).blockExplorers.default.apiUrl;
      const response = await fetch(`${blockExplorerApiUrl}/address/${address}`);
      const addressData = await response.json();
      const tokens = Object.keys(addressData.balances)
        .filter((tokenAddress) => Number(addressData.balances[tokenAddress].balance) > 0)
        .map((tokenAddress) => ({
          address: tokenAddress,
          isNFT: false,
          ...addressData.balances[tokenAddress],
        }));

      const ethToken = tokens.find((token) => token.address.toLowerCase() === ZKSYNC_ETH_ADDRESS);
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
    if (!initialized.current) {
      initialized.current = true;
      fetchUserTokens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    setValue(tokens.find((token) => token.address === event.target.value) || null);
  };

  return (
    <Box>
      <FormControl sx={{ minWidth: "400px" }}>
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
