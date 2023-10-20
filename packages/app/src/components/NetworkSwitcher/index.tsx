import { Box, FormControl, FormControlLabel, RadioGroup, Radio, CircularProgress, Alert } from "@mui/material";
import { useNetwork, useSwitchNetwork } from "wagmi";

export default function NetworkSwitcher() {
  const { chain } = useNetwork();
  const { chains, error, isLoading, switchNetwork } = useSwitchNetwork();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chainId = (event.target as HTMLInputElement).value;
    switchNetwork?.(parseInt(chainId, 10));
  };

  return (
    <Box>
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", marginY: "20px" }}>
          <CircularProgress color="inherit" />
        </Box>
      )}
      {!isLoading && (
        <FormControl>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={chain?.id}
            onChange={handleChange}
          >
            {chains.map((chain) => (
              <Box key={chain.id}>
                <FormControlLabel
                  value={chain.id}
                  control={<Radio />}
                  label={chain.name || chain.id}
                  disabled={!switchNetwork}
                />
              </Box>
            ))}
          </RadioGroup>
        </FormControl>
      )}
      {error && <Alert severity="error">{error.message}</Alert>}
    </Box>
  );
}
