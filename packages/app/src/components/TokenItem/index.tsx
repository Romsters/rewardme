import { Box, Chip, Tooltip } from "@mui/material";
import { formatTokenBalance, formatAddressToDisplay } from "../../utils";

export interface Token {
  address: `0x${string}`;
  balance: string;
  isNFT: boolean;
  token: {
    decimals: number;
    symbol: string;
  };
}

export default function TokenItem(props: Token) {
  const balance = formatTokenBalance(props.balance, props.token.decimals);
  const address = formatAddressToDisplay(props.address);

  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Chip
        color={props.isNFT ? "warning" : "primary"}
        sx={{ width: "80px", marginRight: "10px", fontWeight: "bold" }}
        label={props.isNFT ? "NFT" : "ERC20"}
      />
      <Chip sx={{ width: "80px", marginRight: "10px" }} label={props.token.symbol} />
      <Box component="span" sx={{ marginRight: "30px" }}>
        {address}
      </Box>
      <Tooltip title={balance}>
        <Box
          component="span"
          sx={{
            maxWidth: "120px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "primary.main",
            marginLeft: "auto",
            textAlign: "right",
          }}
        >
          {balance}
        </Box>
      </Tooltip>
    </Box>
  );
}
