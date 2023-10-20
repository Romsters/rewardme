import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { WagmiConfig } from "wagmi";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Home from "./views/Home";
import Claim from "./views/Claim";
import Connect from "./views/Connect";
import Error from "./views/Error";
import { config } from "./config";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
  },
  {
    path: "/claim",
    element: <Claim />,
  },
  {
    path: "/connect",
    element: <Connect />,
  },
  {
    path: "/auth/callback",
    element: <></>,
  },
]);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <WagmiConfig config={config}>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_AUTH_PUBLIC_KEY!}>
          <RouterProvider router={router} />
        </GoogleOAuthProvider>
      </WagmiConfig>
    </ThemeProvider>
  );
};

export default App;
