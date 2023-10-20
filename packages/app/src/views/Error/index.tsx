import { useRouteError } from "react-router-dom";
import { Container, Alert } from "@mui/material";
import Header from "../../components/Header";

const Error = () => {
  const error: any = useRouteError();

  return (
    <Container>
      <Header />
      <Alert severity="error">{error?.statusText || error?.message}</Alert>
    </Container>
  );
};

export default Error;
