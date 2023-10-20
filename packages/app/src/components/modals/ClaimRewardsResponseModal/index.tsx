import { Box, Typography, Modal, Link } from "@mui/material";
import ConfettiExplosion from "react-confetti-explosion";
import "./index.css";

export interface ClaimRewardsResponseModalProps {
  isOpened: boolean;
  handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  txUrl: string;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  maxWidth: "600px",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  borderRadius: "8px",
  overflow: "hidden",
  p: 4,
};

export default function ClaimRewardsResponseModal({ isOpened, handleClose, txUrl }: ClaimRewardsResponseModalProps) {
  return (
    <Modal
      open={isOpened}
      onClose={handleClose}
      aria-labelledby="claim-rewards-response"
      aria-describedby="claim-rewards-response"
    >
      <Box sx={style}>
        <div className="ClaimRewardsResponseModalContainer">
          <ConfettiExplosion zIndex={2000} />
        </div>
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            paddingY: "60px",
          }}
        >
          <Typography
            id="claim-rewards-modal-title"
            variant="h4"
            component="h2"
            align="center"
            color="warning.main"
            marginBottom="20px"
          >
            Congratulations!
          </Typography>
          <Typography id="claim-rewards-modal-title" align="center">
            <Typography variant="subtitle1">Your rewards are sent to your account!</Typography>
            <Link href={txUrl}>Check the transaction in explorer</Link>
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}
