import React from "react";
import { Box, TextField } from "@mui/material";
import { type Token } from "../TokenItem";

export interface TokenValueInputProps {
  value: string;
  setValue: (value: string) => void;
  token: Token;
}

export default function TokenValueInput({ token, value, setValue }: TokenValueInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <Box>
      {!token.isNFT && (
        <TextField
          id="value"
          label="Amount"
          type="number"
          value={value}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
      )}
      {token.isNFT && (
        <TextField
          id="value"
          label="Token ID"
          type="number"
          value={value}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
      )}
    </Box>
  );
}
