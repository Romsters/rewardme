import { Box, Chip, Typography, Tooltip, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { formatTokenBalance, formatAddressToDisplay } from "../../utils";
import "./index.css";

export interface Reward {
  from: `0x${string}`;
  description: string;
  token: `0x${string}`;
  amount: BigInt;
  tokenId: BigInt;
  tokenType: number;
  decimals: number;
  symbol: string;
  tokenURI: string;
  [key: string]: string | BigInt | number;
}

export default function RewardItem(reward: Reward) {
  const amount = formatTokenBalance(reward.amount.toString(), reward.decimals || 0);
  const from = formatAddressToDisplay(reward.from);

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        bgcolor: "rgba(255, 167, 38, 0.05)",
        marginY: "10px",
        paddingBottom: "16px",
        borderRadius: "8px",
        borderBottom: "3px solid",
        borderLeft: "1px solid",
        borderColor: "rgba(255, 167, 38, 0.1)",
      }}
    >
      <ListItemAvatar sx={{ marginRight: "40px" }}>
        {reward.tokenType === 2 && (
          <Box
            sx={{
              width: "120px",
              height: "80px",
            }}
          >
            <div className="ERC721">
              <Box
                sx={{
                  padding: "5px",
                  ...(reward.tokenURI && {
                    backgroundImage: `url("${reward.tokenURI}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width: "100%",
                    height: "100%",
                  }),
                }}
              >
                <Chip size="small" label="NFT" sx={{ fontWeight: "bold" }} />
              </Box>
            </div>
          </Box>
        )}
        {reward.tokenType !== 2 && (
          <Box
            sx={{
              width: "120px",
              height: "80px",
            }}
          >
            <div className="ERC20">
              <Chip size="small" label="ERC20" sx={{ fontWeight: "bold" }} />
            </div>
          </Box>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={
          <>
            {reward.tokenType !== 2 && (
              <Typography
                component="span"
                sx={{
                  display: "inline-block",
                  verticalAlign: "bottom",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {amount}&nbsp;
              </Typography>
            )}
            <Typography component="span">
              <Tooltip title={reward.token} placement="top">
                <Typography color="warning.light" component="span" sx={{ fontWeight: "bold" }}>
                  {reward.symbol}
                </Typography>
              </Tooltip>
            </Typography>
            {reward.tokenType === 2 && (
              <Typography component="span" sx={{}}>
                {" №"}
                {reward.tokenId.toString()}
              </Typography>
            )}
            <Typography component="span" sx={{ marginX: "20px" }}>
              {"from"}
            </Typography>
            <Tooltip title={reward.from} placement="top">
              <Typography component="span" sx={{ color: "primary.main" }}>
                {from}
              </Typography>
            </Tooltip>
          </>
        }
        secondary={<Box sx={{ marginTop: "10px" }}>{reward.description}</Box>}
      />
    </ListItem>
  );
}
