import { Container, Box, Button, Alert, Typography, Slide } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAccount, useConnect } from "wagmi";
import Header from "../../components/Header";

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
  const { connect, connectors, error } = useConnect();

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
        {connectors
          .filter((connector) => connector.ready)
          .map((connector) => (
            <Button
              key={connector.id}
              variant="contained"
              size="large"
              sx={{ minWidth: "320px", maxWidth: "400px", marginX: "auto", marginBottom: "20px" }}
              onClick={() => connect({ connector })}
            >
              Connect with {connector.name}
            </Button>
          ))}
        {error && <Alert severity="error">{error.message}</Alert>}
      </Box>
    </Container>
  );
};

export default Connect;
