import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useDisconnect, useAccount, useNetwork } from "wagmi";
import { AppBar, Box, Toolbar, IconButton, Typography, Tabs, Menu, MenuItem, Chip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { formatAddressToDisplay } from "../../utils";
import { isSamePageLinkNavigation } from "./utils";
import LinkTab from "./LinkTab";
import NetworkSwitchModal from "../modals/NetworkSwitchModal";
import "./index.css";

const routes = [
  {
    label: "Send reward",
    to: "/",
  },
  {
    label: "View/Claim reward",
    to: "/claim",
  },
];

function Header() {
  const { pathname } = useLocation();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isNetworkSwitchModalOpened, setNetworkSwitchModalOpened] = useState(false);
  const [currentTab, selectTab] = useState(routes.findIndex((route) => route.to === pathname));
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const displayedAddress = isConnected && address ? formatAddressToDisplay(address) : "Not connected";
  const connectedChain = isConnected && address && chain ? chain.name || chain.id : "";

  const handleDisconnect = () => {
    disconnect();
    handleCloseUserMenu();
  };

  const handleSwitchNetwork = () => {
    setNetworkSwitchModalOpened(true);
    handleCloseUserMenu();
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    handleCloseNavMenu();
    // event.type can be equal to focus with selectionFollowsFocus.
    if (
      event.type !== "click" ||
      (event.type === "click" && isSamePageLinkNavigation(event as React.MouseEvent<HTMLAnchorElement, MouseEvent>))
    ) {
      selectTab(newValue);
    }
  };

  return (
    <AppBar position="static" sx={{ background: "inherit" }}>
      <Toolbar disableGutters>
        <EmojiEventsIcon color="warning" sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: "none", md: "flex" },
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <Box component="span">Reward</Box>
          <Box component="span" sx={{ color: "warning.main" }}>
            Me
          </Box>
        </Typography>
        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleOpenNavMenu}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            sx={{
              display: { xs: "block", md: "none" },
            }}
          >
            {routes.map((route, index) => (
              <MenuItem key={route.label} selected={currentTab === index} onClick={handleCloseNavMenu}>
                <Link className="Link" {...route}>
                  <Typography textAlign="center">{route.label}</Typography>
                </Link>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        <Typography
          variant="h5"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: "flex", md: "none" },
            flexGrow: 1,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <EmojiEventsIcon color="warning" />
        </Typography>
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            {routes.map((page) => (
              <LinkTab key={page.label} label={page.label} to={page.to} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 0 }}>
          <Chip
            icon={<AccountCircleIcon color="warning" />}
            label={`${displayedAddress} ${connectedChain ? `at ${connectedChain}` : ""}`}
            onClick={handleOpenUserMenu}
          />
          {isConnected && (
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem key="switch" onClick={handleSwitchNetwork}>
                <Typography textAlign="center">Switch network</Typography>
              </MenuItem>
              <MenuItem key="disconnect" onClick={handleDisconnect}>
                <Typography textAlign="center">Disconnect</Typography>
              </MenuItem>
            </Menu>
          )}
        </Box>
      </Toolbar>
      <NetworkSwitchModal
        isOpened={isNetworkSwitchModalOpened}
        handleClose={() => setNetworkSwitchModalOpened(false)}
      />
    </AppBar>
  );
}

export default Header;
