import { Container, Box, Button, Alert, Typography, Slide } from "@mui/material";
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
  maxWidth: "800px",
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
        <Slide direction="down" timeout={1000} in mountOnEnter unmountOnExit>
          <Typography
            variant="h4"
            sx={{
              maxWidth: "600px",
              marginX: "auto",
              marginBottom: "60px",
              textAlign: "center",
            }}
          >
            Want to send a crypto reward to somebody, but you don't know the receiver's account address?
          </Typography>
        </Slide>
        <Button variant="contained" size="large" sx={{ width: "400px", marginX: "auto" }} onClick={() => connect()}>
          Connect Wallet
        </Button>
        {error && <Alert severity="error">{error.message}</Alert>}
      </Box>
    </Container>
  );
};

export default Connect;
