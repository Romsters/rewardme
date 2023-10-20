import { Container, Box, Button, Alert } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAccount, useConnect } from "wagmi";
import Header from "../../components/Header";
import { config } from "../../config";

const style = {
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  maxWidth: "400px",
  p: 4,
};

const Connect = () => {
  const { isConnected } = useAccount();
  const { connect, error } = useConnect({
    connector: config.connectors[0],
  });

  if (isConnected) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <Container>
      <Header />
      <Box sx={style}>
        <Button variant="contained" size="large" onClick={() => connect()}>
          Connect Wallet
        </Button>
        {error && <Alert severity="error">{error.message}</Alert>}
      </Box>
    </Container>
  );
};

export default Connect;
