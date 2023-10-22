import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { GoogleLogin, CredentialResponse as GoogleLoginResponse } from "@react-oauth/google";
import { useDebounce } from "use-debounce";
import { Container, Box, Typography, TextField, Alert, CircularProgress, List, Snackbar } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import { LoadingButton } from "@mui/lab";
import { useAccount, useNetwork } from "wagmi";
import { getRewardList, type Reward, claimRewards } from "./api";
import { GithubLogin, GithubLoginResponse } from "../../components/GithubLogin";
import Header from "../../components/Header";
import RewardItem from "../../components/RewardItem";
import ClaimRewardsResponseModal from "../../components/modals/ClaimRewardsResponseModal";

interface SignatureResponse {
  username: string;
  message: {
    address: string;
    id: string;
    provider: string;
    nonce: string;
  };
  signature: string;
}

const Claim = () => {
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const [receiver, setReceiver] = useState("");
  const [receiverDebounced] = useDebounce(receiver, 1000);
  const [signatureResponse, setSignatureResponse] = useState<SignatureResponse | null>(null);
  const [isRequestingSignature, setRequestingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState("");

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isRewardsLoading, setRewardsLoading] = useState(false);

  const [isClaiming, setClaiming] = useState(false);
  const [isLoginRequired, setLoginRequired] = useState(false);
  const [claimRewardsError, setClaimRewardsError] = useState("");
  const [claimRewardsTxHash, setClaimRewardsTxHash] = useState("");

  const systemContractAddress = (chain as any)?.systemContractAddress;
  const isL2 = !!(chain as any)?.isL2;

  const fetchRewards = async () => {
    if (!receiverDebounced) {
      return;
    }
    setRewards([]);
    setRewardsLoading(true);
    try {
      const rewards = await getRewardList(systemContractAddress, receiverDebounced, isL2);
      setRewards(rewards);
    } finally {
      setRewardsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverDebounced]);

  // using to request a signature valid for 1 hour
  const nonce = Math.floor(new Date().getTime() / 1000 + 3600).toString(16);

  const onSuccessGoogleLogin = (credentialResponse: GoogleLoginResponse) => {
    setClaimRewardsError("");
    setSignatureError("");
    setLoginRequired(false);
    requestSignature(credentialResponse.credential as string, "GOOGLE");
  };

  const onErrorGoogleLogin = () => {
    setSignatureError("Failed to sign in");
  };

  const onSuccessGithubLogin = (credentialResponse: GithubLoginResponse) => {
    setClaimRewardsError("");
    setSignatureError("");
    setLoginRequired(false);
    requestSignature(credentialResponse.code, "GITHUB");
  };

  const onErrorGithubLogin = () => {
    setSignatureError("Failed to sign in");
  };

  const requestSignature = async (token: string, provider: string) => {
    setRequestingSignature(true);
    setSignatureError("");
    setSignatureResponse(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          token,
          address,
          nonce,
        }),
      });
      if (res.status >= 300) {
        const data = await res.text();
        setSignatureError(data);
        return;
      }
      const data = await res.json();
      setSignatureResponse(data);
      setReceiver(data.username);
    } catch (err: any) {
      setSignatureError(err.message);
    } finally {
      setRequestingSignature(false);
    }
  };

  const submitClaimRewards = async () => {
    setClaimRewardsError("");
    setLoginRequired(false);
    const signatureExp = new Date(parseInt(signatureResponse?.message?.nonce || "0", 16) * 1000);
    if (
      signatureResponse?.username?.toLowerCase() !== receiver.toLowerCase() ||
      signatureResponse?.message.address !== address?.toLowerCase() ||
      new Date() > signatureExp
    ) {
      setLoginRequired(true);
      return;
    }
    setClaiming(true);
    try {
      const txHash = await claimRewards(
        systemContractAddress,
        receiver,
        signatureResponse?.message.provider as string,
        signatureResponse?.message.nonce as string,
        signatureResponse?.signature as string
      );
      setClaimRewardsTxHash(txHash);
    } catch (err: any) {
      setClaimRewardsError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  const handleCloseClaimRewardsResponseModal = () => {
    setClaimRewardsTxHash("");
    setRewards([]);
  };

  if (!isConnected) {
    return <Navigate to="/connect" replace={true} />;
  }

  return (
    <Container>
      <Header />
      <Box>
        <Typography paddingTop="30px" paddingBottom="10px" variant="h4">
          <Box component="span" paddingRight="20px">
            View and Claim crypto rewards
          </Box>
          <ReplyIcon color="warning" />
        </Typography>
        <Typography paddingBottom="20px" color="secondary.light">
          You can view crypto rewards by receiver's Github username or Google account email. If you are a receiver just
          prove your account ownership by logging in via Github or Google and claim your reward! The rewarded assets
          will be transferred to the account you have connected with.
        </Typography>
        <Typography marginY="20px">Enter receiver's Github username or Google account email</Typography>
        <Box
          sx={{
            maxWidth: "400px",
          }}
        >
          <TextField
            id="receiver"
            label="Receiver"
            value={receiver}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiver(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <Box
            sx={{
              color: "warning.light",
              textAlign: "center",
              textTransform: "uppercase",
              marginY: "10px",
            }}
          >
            Or
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: "20px",
            }}
          >
            <GithubLogin
              clientId={process.env.REACT_APP_GITHUB_APP_CLIENT_ID!}
              onSuccess={onSuccessGithubLogin}
              onFailure={onErrorGithubLogin}
            />
            <GoogleLogin
              nonce={nonce}
              onSuccess={onSuccessGoogleLogin}
              onError={onErrorGoogleLogin}
              theme="outline"
              width="182px"
            />
          </Box>
          {signatureError && (
            <Alert severity="error" sx={{ marginY: "20px" }}>
              {signatureError}
            </Alert>
          )}
        </Box>
        <Box sx={{ marginY: "40px" }}>
          {(isRewardsLoading || isRequestingSignature) && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress color="inherit" />
            </Box>
          )}
          {!isRewardsLoading && !isRequestingSignature && (
            <>
              {rewards.length === 0 && !!receiverDebounced && (
                <Alert severity="warning" sx={{}}>
                  No rewards found for the account
                </Alert>
              )}
              <List>
                {rewards.map((reward, index: number) => (
                  <RewardItem key={index} {...reward} />
                ))}
              </List>
            </>
          )}
        </Box>
        <Box sx={{ textAlign: "center", marginBottom: "60px" }}>
          {!isRewardsLoading && !isRequestingSignature && rewards.length > 0 && (
            <LoadingButton
              color="warning"
              loading={isClaiming}
              loadingPosition="start"
              startIcon={<ReplyIcon />}
              variant="contained"
              onClick={submitClaimRewards}
              disabled={isClaiming}
              sx={{ mt: 1, mr: 1, fontWeight: "bold" }}
              size="large"
            >
              Claim all rewards
            </LoadingButton>
          )}
        </Box>
      </Box>
      <ClaimRewardsResponseModal
        isOpened={!!claimRewardsTxHash}
        handleClose={handleCloseClaimRewardsResponseModal}
        txUrl={`${chain?.blockExplorers?.default.url}/tx/${claimRewardsTxHash}`}
      />
      {claimRewardsError && (
        <Alert severity="error" sx={{ marginBottom: "60px" }}>
          {claimRewardsError}
        </Alert>
      )}
      <Snackbar
        open={isLoginRequired}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={() => setLoginRequired(false)}
      >
        <Alert onClose={() => setLoginRequired(false)} severity="warning">
          Please Sign in with Github or Google first
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Claim;
