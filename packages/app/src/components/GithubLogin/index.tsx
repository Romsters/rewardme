import { ReactNode } from "react";
import { Button } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

import PopupWindow from "./PopupWindow";
import { toQuery } from "./utils";

export type GithubLoginProps = {
  clientId: string;
  buttonText?: string;
  children?: ReactNode;
  className?: string;
  onRequest?: () => void;
  onSuccess?: (data: GithubLoginResponse) => void;
  onFailure?: (error: Error) => void;
  popupHeight?: number;
  popupWidth?: number;
  redirectUri?: string;
  scope?: string;
  nonce?: string;
  disabled?: boolean;
};

export type GithubLoginResponse = {
  code: string;
};

export const GithubLogin = ({
  buttonText = "Sign in with GitHub",
  children,
  className,
  clientId,
  onRequest = () => {},
  onSuccess = () => {},
  onFailure = () => {},
  popupHeight = 650,
  popupWidth = 500,
  redirectUri = "",
  scope = "user:email",
  nonce = "",
  disabled = false,
}: GithubLoginProps) => {
  const _onRequest = () => {
    return onRequest();
  };

  const _onFailure = (error: Error) => {
    return onFailure(error);
  };

  const _onSuccess = async (data: GithubLoginResponse) => {
    if (!data.code) {
      return _onFailure(new Error("'code' not found"));
    }
    return onSuccess(data);
  };

  const onBtnClick = () => {
    const search = toQuery({
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      state: nonce,
    });

    // To fix issues with window.screen in multi-monitor setups, the easier option is to
    // center the pop-up over the parent window.
    const top = (window?.top?.outerHeight || 0) / 2 + (window?.top?.screenY || 0) - popupHeight / 2;
    const left = (window?.top?.outerWidth || 0) / 2 + (window?.top?.screenX || 0) - popupWidth / 2;

    const popup = PopupWindow.open("github-oauth-authorize", `https://github.com/login/oauth/authorize?${search}`, {
      height: popupHeight,
      width: popupWidth,
      top: top,
      left: left,
    });

    _onRequest();
    popup.then(
      (data: Record<string, string | number>) => _onSuccess(data as GithubLoginResponse),
      (error: Error) => _onFailure(error)
    );
  };

  const attrs = {
    onClick: onBtnClick,
    className: className || "",
    disabled: disabled || false,
  };
  return (
    <Button {...attrs} variant="contained" startIcon={<GitHubIcon />} sx={{ textTransform: "none" }}>
      {children || buttonText}
    </Button>
  );
};
