import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Container,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Button,
  Link,
  TextField,
  Alert,
  AlertTitle,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { LoadingButton } from "@mui/lab";
import { useAccount, useNetwork, erc721ABI, erc20ABI } from "wagmi";
import { writeContract, prepareWriteContract } from "@wagmi/core";
import { ethers } from "ethers";
import { ZKSYNC_ETH_ADDRESS, waitForTransaction } from "../../utils";
import { sendETHReward, sendTokenReward, sendNFTReward } from "./utils";
import Header from "../../components/Header";
import { type Token } from "../../components/TokenItem";
import TokenSelect from "../../components/TokenSelect";
import TokenValueInput from "../../components/TokenValueInput";

const Home = () => {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const systemContractAddress = (chain as any)?.systemContractAddress;

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [description, setDescription] = useState("");

  const selectedParsedValue = ethers.utils.parseUnits(selectedValue || "0", selectedToken?.token.decimals).toBigInt();

  const steps = [
    {
      label: "Select asset to transfer",
      description:
        "You can select ETH, ERC20 token or NFT token. The selected asset will be sent to the system contract and only the account owner you specify will be able to claim it.",
      content: <TokenSelect value={selectedToken} setValue={setSelectedToken} />,
      isValid: !!selectedToken,
    },
    {
      label: "Specify value to transfer",
      description: "For ETH or ERC20 token set number of tokens you want to transfer. For NFT just provide a token id.",
      isValid: !!selectedValue,
      content: <TokenValueInput token={selectedToken!} value={selectedValue} setValue={setSelectedValue} />,
    },
    {
      label: "Set the receiver",
      description: `You can provide a Github username or Google account email. The receiver must have access to this account in order to claim the reward you send.`,
      content: (
        <Box>
          <TextField
            id="receiver"
            label="Receiver"
            value={selectedReceiver}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedReceiver(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Typography variant="body2" marginY="20px" color="secondary.light">
            Optionally write a description for you reward. The receiver will be able to read it.
          </Typography>
          <TextField
            fullWidth
            id="description"
            label="Description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      ),
      isValid: !!selectedReceiver,
    },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [isSendRewardLoading, setIsSendRewardLoading] = useState(false);
  const [sendRewardError, setSendRewardError] = useState("");
  const [sentRewardTxHash, setSentRewardTxHash] = useState("");
  const sentRewardTxUrl = `${chain?.blockExplorers?.default.url}/tx/${sentRewardTxHash}`;

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      setIsSendRewardLoading(true);
      setSendRewardError("");
      try {
        if (selectedToken?.address.toLowerCase() === ZKSYNC_ETH_ADDRESS) {
          const txHash = await sendETHReward(systemContractAddress, selectedReceiver, selectedParsedValue, description);
          setSentRewardTxHash(txHash);
        } else if (selectedToken?.isNFT) {
          const config = await prepareWriteContract({
            address: selectedToken?.address as `0x${string}`,
            abi: erc721ABI,
            functionName: "approve",
            args: [systemContractAddress, selectedParsedValue],
          });
          const data = await writeContract(config);
          await waitForTransaction({
            hash: data.hash,
          });
          const txHash = await sendNFTReward(
            systemContractAddress,
            selectedReceiver,
            selectedToken!,
            selectedParsedValue,
            description
          );
          setSentRewardTxHash(txHash);
        } else {
          const config = await prepareWriteContract({
            address: selectedToken?.address as `0x${string}`,
            abi: erc20ABI,
            functionName: "approve",
            args: [systemContractAddress, selectedParsedValue],
          });
          const data = await writeContract(config);
          await waitForTransaction({
            hash: data.hash,
          });
          const txHash = await sendTokenReward(
            systemContractAddress,
            selectedReceiver,
            selectedToken!,
            selectedParsedValue,
            description
          );
          setSentRewardTxHash(txHash);
        }
      } catch (err: any) {
        setSendRewardError(err.message);
      } finally {
        setIsSendRewardLoading(false);
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setSelectedToken(null);
    setSelectedValue("");
    setSelectedReceiver("");
    setDescription("");
    setActiveStep(0);
    setSentRewardTxHash("");
  };

  const handleTryAgain = () => {
    setActiveStep(steps.length - 1);
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
            Send crypto reward
          </Box>
          <SendIcon color="warning" />
        </Typography>
        <Typography paddingBottom="30px" color="secondary.light">
          You can send a crypto reward to anyone you want using just receiver's Github username or Google account email!
          The receiver will be able to claim it by confirming access to that account. It's easy! Just complete the form
          below:
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel optional={index === 2 ? <Typography variant="caption">Final step</Typography> : null}>
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                {step.content && <Box marginY="20px">{step.content}</Box>}
                <Box sx={{ mb: 2 }}>
                  <div>
                    {index === steps.length - 1 && (
                      <LoadingButton
                        loading={isSendRewardLoading}
                        loadingPosition="start"
                        startIcon={<SendIcon />}
                        variant="contained"
                        onClick={handleNext}
                        disabled={!step.isValid || isSendRewardLoading}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Send reward
                      </LoadingButton>
                    )}
                    {index !== steps.length - 1 && (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!step.isValid || isSendRewardLoading}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Continue
                      </Button>
                    )}
                    <Button disabled={index === 0 || isSendRewardLoading} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Box sx={{ p: 3 }}>
            {sendRewardError && (
              <>
                <Alert severity="error">
                  <AlertTitle>Failed to send the reward</AlertTitle>
                  {sendRewardError}
                </Alert>
                <Button onClick={handleTryAgain} sx={{ mt: 1, mr: 1 }}>
                  Try again
                </Button>
              </>
            )}
            {!sendRewardError && (
              <>
                <Alert severity="success">
                  The reward is sent!
                  <Link href={sentRewardTxUrl}> Check the transaction in explorer</Link>
                </Alert>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Send one more
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Home;
